/* eslint-disable @next/next/no-img-element */

/* =========================================================
   BOOKING SUMMARY — PRINTABLE DOCUMENT LAYOUT

   Pure presentation, rendered off-screen and rasterized by
   bookingSummaryPdf.ts (html2canvas -> jsPDF), the same pattern
   src/app/admin/operation-handling/OrderReportPDF.tsx uses. Never
   mounted directly on a route.
========================================================= */

import {
  CalendarRange,
  Clock3,
  FileText,
  Megaphone,
  Percent,
  Truck,
  UserRound,
} from "lucide-react";

import type { BookingSummaryPdfData, PdfVehicleType } from "./bookingSummaryPdf";

const ADINN_LOGO = "/images/assets/Roadshow_AdinnLogo.svg";
export const FALLBACK_VEHICLE_ICON = "/images/Truck_Image.jpg";

const STATUS_LABELS: Record<number, string> = {
  0: "Request Submitted",
  1: "In Progress",
  2: "Converted to Order",
};

function formatINR(value?: number) {
  return `₹ ${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function vehicleName(vehicle: PdfVehicleType) {
  if (
    vehicle.vehicleType &&
    typeof vehicle.vehicleType === "object" &&
    vehicle.vehicleType.name
  ) {
    return vehicle.vehicleType.name;
  }
  return vehicle.vehicleName || "Roadshow Vehicle";
}

/* ── Inline style constants ─────────────────────────────────────────── */
const S = {
  page: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: "12px",
    color: "#1a1a1c",
    background: "#ffffff",
    lineHeight: 1.5,
    padding: "36px 40px",
    width: "820px",
  } as React.CSSProperties,

  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingBottom: "18px",
    borderBottom: "2.5px solid #17171a",
    marginBottom: "22px",
  } as React.CSSProperties,

  title: { fontSize: "19px", fontWeight: 700, color: "#111114" } as React.CSSProperties,
  requestId: { fontSize: "12px", color: "#6d6d75", marginTop: "4px" } as React.CSSProperties,
  requestIdValue: { color: "#d70000", fontWeight: 700 } as React.CSSProperties,

  section: { marginBottom: "22px" } as React.CSSProperties,

  sectionHead: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "14px",
  } as React.CSSProperties,

  sectionIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "34px",
    height: "34px",
    borderRadius: "999px",
    background: "#f1f1f4",
    color: "#303035",
    flexShrink: 0,
  } as React.CSSProperties,

  sectionTitle: { fontSize: "13.5px", fontWeight: 700, color: "#111114" } as React.CSSProperties,

  divider: { border: "none", borderTop: "1px solid #ededf0", margin: "0 0 22px" } as React.CSSProperties,

  row3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "18px" } as React.CSSProperties,
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" } as React.CSSProperties,

  fieldLabel: {
    fontSize: "9.5px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "#8a8a92",
  } as React.CSSProperties,
  fieldValue: {
    fontSize: "12.5px",
    fontWeight: 600,
    color: "#202024",
    marginTop: "3px",
  } as React.CSSProperties,

  vehicleCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    borderRadius: "12px",
    border: "1px solid #ededf0",
    padding: "10px 12px",
  } as React.CSSProperties,

  vehicleThumb: {
    width: "46px",
    height: "46px",
    borderRadius: "10px",
    objectFit: "cover" as const,
    background: "#f1f1f4",
    flexShrink: 0,
  } as React.CSSProperties,

  campaignField: { minWidth: "120px" } as React.CSSProperties,

  priceRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "7px 0",
    fontSize: "12px",
    color: "#4c4c53",
  } as React.CSSProperties,

  priceValue: { fontWeight: 700, color: "#202024" } as React.CSSProperties,

  grandTotalRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "10px",
    paddingTop: "14px",
    borderTop: "1.5px dashed #d7d7db",
  } as React.CSSProperties,

  footer: {
    marginTop: "26px",
    paddingTop: "16px",
    borderTop: "3px solid #d70000",
    textAlign: "center" as const,
    fontSize: "10.5px",
    color: "#8a8a92",
  } as React.CSSProperties,
};

export type BookingSummaryDocumentProps = {
  data: BookingSummaryPdfData;
  /** Parallel to data.vehicleTypes — best-effort real vehicle photo, or
   *  FALLBACK_VEHICLE_ICON when one couldn't be resolved. */
  vehicleImages: string[];
};

export default function BookingSummaryDocument({
  data,
  vehicleImages,
}: BookingSummaryDocumentProps) {
  const first = data.vehicleTypes?.[0];

  const campaignVehicle = (data.vehicleTypes || []).find(
    (vehicle) => vehicle.campaignName || vehicle.campaignType
  );

  const hasCgstSgst = Boolean(data.cgstAmount || data.sgstAmount);
  const hasIgst = !hasCgstSgst && Boolean(data.igstAmount);

  return (
    <div style={S.page}>
      {/* ══ HEADER ══ */}
      <div style={S.header}>
        <img src={ADINN_LOGO} alt="Adinn" style={{ height: "44px", objectFit: "contain" }} />

        <div style={{ textAlign: "right" }}>
          <div style={S.title}>Booking Summary</div>
          <div style={S.requestId}>
            Request ID: <span style={S.requestIdValue}>{data.clientOrderId}</span>
          </div>
        </div>
      </div>

      {/* ══ BOOKING STATUS / SUBMITTED ON / BOOKING DATES ══ */}
      <div style={{ ...S.row3, ...S.section }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={S.sectionIcon}>
            <FileText size={16} />
          </span>
          <div>
            <div style={S.fieldLabel}>Booking Status</div>
            <div style={S.fieldValue}>{STATUS_LABELS[Number(data.status ?? 0)] || "Request Submitted"}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={S.sectionIcon}>
            <Clock3 size={16} />
          </span>
          <div>
            <div style={S.fieldLabel}>Submitted On</div>
            <div style={S.fieldValue}>{formatDateTime(data.createdAt)}</div>
          </div>
        </div>

        {first ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={S.sectionIcon}>
              <CalendarRange size={16} />
            </span>
            <div>
              <div style={S.fieldLabel}>Booking Dates</div>
              <div style={S.fieldValue}>
                {formatDate(first.fromDate)} → {formatDate(first.toDate)}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <hr style={S.divider} />

      {/* ══ CUSTOMER + GST DETAILS ══ */}
      <div style={{ ...S.row2, ...S.section }}>
        <div>
          <div style={S.sectionHead}>
            <span style={S.sectionIcon}>
              <UserRound size={16} />
            </span>
            <span style={S.sectionTitle}>Customer Details</span>
          </div>
          <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#202024", lineHeight: 1.7 }}>
            <div>{data.name || "-"}</div>
            <div style={{ color: "#6d6d75", fontWeight: 500 }}>{data.email || "-"}</div>
            <div style={{ color: "#6d6d75", fontWeight: 500 }}>{data.phone || "-"}</div>
          </div>
        </div>

        <div>
          <div style={S.sectionHead}>
            <span style={S.sectionIcon}>
              <Percent size={16} />
            </span>
            <span style={S.sectionTitle}>GST Details</span>
          </div>
          {data.gstNumber ? (
            <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#202024", lineHeight: 1.7 }}>
              <div>{data.gstNumber}</div>
              <div style={{ color: "#6d6d75", fontWeight: 500 }}>{data.companyName || "-"}</div>
              <div style={{ color: "#6d6d75", fontWeight: 500 }}>PAN {data.panNumber || "-"}</div>
            </div>
          ) : (
            <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#8a8a92" }}>
              Individual customer — no GST details
            </div>
          )}
        </div>
      </div>

      <hr style={S.divider} />

      {/* ══ SELECTED VEHICLES ══ */}
      <div style={S.section}>
        <div style={S.sectionHead}>
          <span style={S.sectionIcon}>
            <Truck size={16} />
          </span>
          <span style={S.sectionTitle}>Selected Vehicles</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {(data.vehicleTypes || []).map((vehicle, index) => (
            <div key={index} style={S.vehicleCard}>
              <img
                src={vehicleImages[index] || FALLBACK_VEHICLE_ICON}
                alt={vehicleName(vehicle)}
                style={S.vehicleThumb}
                crossOrigin="anonymous"
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#111114" }}>
                  {index + 1}. {vehicleName(vehicle)}
                </div>
                <div style={{ fontSize: "10.5px", color: "#6d6d75", marginTop: "3px" }}>
                  Quantity: {vehicle.quantity ?? 1} Vehicles
                </div>
                {vehicle.lineTotal ? (
                  <div style={{ fontSize: "10.5px", color: "#6d6d75" }}>
                    Line Total: {formatINR(vehicle.lineTotal)}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ CAMPAIGN DETAILS ══ */}
      {campaignVehicle ? (
        <>
          <hr style={S.divider} />
          <div style={S.section}>
            <div style={S.sectionHead}>
              <span style={S.sectionIcon}>
                <Megaphone size={16} />
              </span>
              <span style={S.sectionTitle}>Campaign Details</span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
              {campaignVehicle.campaignName ? (
                <div style={S.campaignField}>
                  <div style={S.fieldLabel}>Campaign</div>
                  <div style={S.fieldValue}>{campaignVehicle.campaignName}</div>
                </div>
              ) : null}

              {campaignVehicle.campaignType ? (
                <div style={S.campaignField}>
                  <div style={S.fieldLabel}>Campaign Type</div>
                  <div style={S.fieldValue}>{campaignVehicle.campaignType}</div>
                </div>
              ) : null}

              {campaignVehicle.campaignLocation ? (
                <div style={S.campaignField}>
                  <div style={S.fieldLabel}>Location</div>
                  <div style={S.fieldValue}>{campaignVehicle.campaignLocation}</div>
                </div>
              ) : null}

              {campaignVehicle.needPromoter ? (
                <div style={S.campaignField}>
                  <div style={S.fieldLabel}>Promoter</div>
                  <div style={S.fieldValue}>
                    {[
                      campaignVehicle.promoterType,
                      campaignVehicle.promoterGender,
                      campaignVehicle.promoterLanguage?.length
                        ? campaignVehicle.promoterLanguage.join(", ")
                        : "",
                      campaignVehicle.promoterQuantity ? `Qty ${campaignVehicle.promoterQuantity}` : "",
                    ]
                      .filter(Boolean)
                      .join(" · ") || "-"}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </>
      ) : null}

      <hr style={S.divider} />

      {/* ══ PRICING BREAKDOWN ══ */}
      <div style={S.section}>
        <div style={S.sectionHead}>
          <span style={S.sectionIcon}>
            <FileText size={16} />
          </span>
          <span style={S.sectionTitle}>Pricing Breakdown</span>
        </div>

        <div style={S.priceRow}>
          <span>Taxable Amount</span>
          <span style={S.priceValue}>{formatINR(data.subtotal)}</span>
        </div>

        {data.promoterTotal ? (
          <div style={S.priceRow}>
            <span>Promoter Charges (included)</span>
            <span style={S.priceValue}>{formatINR(data.promoterTotal)}</span>
          </div>
        ) : null}

        {hasCgstSgst ? (
          <>
            <div style={S.priceRow}>
              <span>CGST {(Number(data.gstPercentage) || 0) / 2}%</span>
              <span style={S.priceValue}>{formatINR(data.cgstAmount)}</span>
            </div>
            <div style={S.priceRow}>
              <span>SGST {(Number(data.gstPercentage) || 0) / 2}%</span>
              <span style={S.priceValue}>{formatINR(data.sgstAmount)}</span>
            </div>
          </>
        ) : hasIgst ? (
          <div style={S.priceRow}>
            <span>IGST {data.gstPercentage || 0}%</span>
            <span style={S.priceValue}>{formatINR(data.igstAmount)}</span>
          </div>
        ) : (
          <div style={S.priceRow}>
            <span>GST {data.gstPercentage || 0}%</span>
            <span style={S.priceValue}>{formatINR(data.gstAmount)}</span>
          </div>
        )}

        <div style={S.grandTotalRow}>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#111114" }}>Grand Total</span>
          <span style={{ fontSize: "16px", fontWeight: 800, color: "#d70000" }}>
            {formatINR(data.estimatedTotal)}
          </span>
        </div>
      </div>

      <div style={S.footer}>Thank you for choosing Adinn. We look forward to serving you.</div>
    </div>
  );
}
