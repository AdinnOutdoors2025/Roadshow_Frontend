/* =========================================================
   SHARED BOOKING SUMMARY PDF BUILDER

   One `client-requests` record → one PDF, rendered from the
   BookingSummaryDocument layout (Adinn logo, status/date row, customer +
   GST details, per-vehicle photos, campaign details, pricing breakdown)
   via html2canvas + jsPDF — the same render-to-image pattern already
   used by src/app/admin/operation-handling/OrderReportPDF.tsx and
   src/app/admin/invoice-generation/InvoiceTab.tsx.

   Used by three places that all need the same summary document:
     - the Thank You page ("Download Summary")
     - My Bookings (row-level "Download Summary")
     - the "View Summary PDF" viewer page (embeds it inline)

   Kept framework-free at the call-site API (no JSX in these call sites):
   the two exported functions below still just take plain data and hand
   back either a saved file or a blob URL. React only enters the picture
   internally, to lay the document out before it's rasterized.
========================================================= */

import { createElement } from "react";

/* Kept as a local literal (rather than importing it from
   BookingSummaryDocument) so this module's only static import stays
   "react" — everything document/browser-related loads dynamically,
   mirroring the jspdf/html2canvas dynamic-import convention below. */
const FALLBACK_VEHICLE_ICON = "/images/Truck_Image.jpg";

/* Local duplicate of roadshowVehicles.tsx's own helper (not exported there)
   — kept local for the same reason FALLBACK_VEHICLE_ICON is above. */
const normalizeModelName = (value: unknown): string =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

export type PdfVehicleType = {
  vehicleId?: string;
  /* Package rate-card's vehicleType id + the model name string — a booking
     line is placed against a Package (type + model name), not a specific
     vehicleDetails catalog document, so these are what resolveVehicleImages
     actually has to match the live catalog against. */
  vehicleTypeId?: string;
  vehicleModel?: string;
  vehicleType?: string | { _id?: string; name?: string } | null;
  vehicleName?: string;
  /* Pre-resolved server-side (ClientRequestController's attachTrackingSummary)
     by matching vehicleType directly against the vehicleDetails catalog —
     when a caller already supplies this, it's at least as good as anything
     resolveVehicleImages could recompute, so it's used as-is. */
  vehicleTypeImage?: string | null;
  quantity?: number;
  fromDate?: string;
  toDate?: string;
  totalDays?: number;

  campaignType?: string;
  campaignName?: string;
  campaignLocation?: string;
  pricePerDay?: number;
  lineTotal?: number;
  rentalCost?: number;
  rtoCost?: number;
  needPromoter?: boolean;
  promoterType?: string;
  promoterGender?: string;
  promoterLanguage?: string[];
  promoterQuantity?: number;
  promoterCost?: number;
};

export type BookingSummaryPdfData = {
  clientOrderId: string;
  name?: string;
  email?: string;
  phone?: string;

  status?: number;
  createdAt?: string;

  customerCategory?: "individual" | "organization";
  gstNumber?: string;
  companyName?: string;
  panNumber?: string;

  vehicleTypes: PdfVehicleType[];

  subtotal?: number;
  gstPercentage?: number;
  gstAmount?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  promoterTotal?: number;
  estimatedTotal?: number;
};

/** Resolves vehicle.vehicleType whether it arrives as a flat id string (the
 *  emailed-PDF path) or a populated {_id, name} object (ClientRequestController's
 *  /client-requests/:id response). */
const extractVehicleTypeId = (vehicle: PdfVehicleType): string => {
  if (vehicle.vehicleTypeId) return String(vehicle.vehicleTypeId);

  const type = vehicle.vehicleType;
  if (type && typeof type === "object") return String(type._id || "");
  if (typeof type === "string") return type;

  return "";
};

/** Best-effort real photo per vehicle line, in priority order:
 *  1. vehicleTypeImage, when the caller already resolved one server-side
 *     (ClientRequestController does this by matching vehicleType directly
 *     against the vehicleDetails catalog).
 *  2. An exact vehicleId match against the public vehicle inventory (valid
 *     if a caller ever has a real vehicleDetails catalog id).
 *  3. vehicleType + model name match — what admin-created bookings actually
 *     carry, since those are placed against a Package rate card, not a
 *     specific catalog document.
 *  4. vehicleType alone — a booking's Package-level "model" (e.g.
 *     "Non-Customizable Vehicle") is a pricing-tier label, not the catalog's
 *     model name, so it very often can't match anything in step 3 even when
 *     the catalog has exactly one (obviously correct) photo for that type.
 *  Falls back to the generic vehicle icon per line — offline, a deleted
 *  vehicle, or no match at all degrade to that rather than failing the
 *  whole PDF. */
export async function resolveVehicleImages(vehicleTypes: PdfVehicleType[]): Promise<string[]> {
  if (!vehicleTypes?.length) return [];

  try {
    const { fetchAllRoadshowVehicles } = await import("./roadshowVehicles");
    const vehicles = await fetchAllRoadshowVehicles();
    const imageById = new Map(vehicles.map((vehicle) => [String(vehicle.id), vehicle.image]));

    return vehicleTypes.map((vehicle) => {
      if (vehicle.vehicleTypeImage) return vehicle.vehicleTypeImage;

      const direct = vehicle.vehicleId && imageById.get(String(vehicle.vehicleId));
      if (direct) return direct;

      const typeId = extractVehicleTypeId(vehicle);
      const modelKey = normalizeModelName(vehicle.vehicleModel);

      const matchedByTypeAndModel =
        typeId && modelKey
          ? vehicles.find(
              (v) => String(v.vehicleTypeId) === typeId && normalizeModelName(v.name) === modelKey
            )
          : null;

      const matchedByTypeOnly =
        !matchedByTypeAndModel && typeId
          ? vehicles.find((v) => String(v.vehicleTypeId) === typeId)
          : null;

      return (
        matchedByTypeAndModel?.image || matchedByTypeOnly?.image || FALLBACK_VEHICLE_ICON
      );
    });
  } catch {
    return vehicleTypes.map(() => FALLBACK_VEHICLE_ICON);
  }
}

/** Resolves once every <img> under `container` has either loaded or
 *  failed — html2canvas must not run before that, or photos render
 *  blank. A failed image (e.g. blocked by CORS) still resolves so one
 *  bad photo can't hang the whole download. */
function waitForImages(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll("img"));

  return Promise.all(
    images.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          })
    )
  ).then(() => undefined);
}

/** Lays out the summary off-screen and rasterizes it to a canvas. */
async function renderSummaryCanvas(data: BookingSummaryPdfData) {
  const [{ default: BookingSummaryDocument }, { createRoot }, { flushSync }, { default: html2canvas }, vehicleImages] =
    await Promise.all([
      import("./BookingSummaryDocument"),
      import("react-dom/client"),
      import("react-dom"),
      import("html2canvas"),
      resolveVehicleImages(data.vehicleTypes || []),
    ]);

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "-99999px";
  container.style.left = "0";
  container.style.zIndex = "-1";
  document.body.appendChild(container);

  const root = createRoot(container);

  try {
    flushSync(() => {
      root.render(createElement(BookingSummaryDocument, { data, vehicleImages }));
    });

    await waitForImages(container);

    return await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
  } finally {
    root.unmount();
    container.remove();
  }
}

/** Paginates the rasterized summary into an A4 jsPDF document — most
 *  bookings fit one page, but this still slices cleanly if campaign
 *  details push it past a page height. */
async function renderSummaryDoc(data: BookingSummaryPdfData) {
  const canvas = await renderSummaryCanvas(data);
  const { default: JsPDF } = await import("jspdf");

  const doc = new JsPDF({ orientation: "portrait", unit: "px", format: "a4" });
  const pdfWidth = doc.internal.pageSize.getWidth();
  const pdfHeight = doc.internal.pageSize.getHeight();
  const ratio = pdfWidth / canvas.width;
  const scaledHeight = canvas.height * ratio;

  if (scaledHeight <= pdfHeight) {
    doc.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pdfWidth, scaledHeight);
    return doc;
  }

  const sliceHeightPx = Math.max(Math.floor(pdfHeight / ratio), 1);
  let yOffset = 0;
  let pageNum = 0;

  while (yOffset < canvas.height) {
    const height = Math.min(sliceHeightPx, canvas.height - yOffset);
    if (pageNum > 0) doc.addPage();

    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = height;

    const ctx = pageCanvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(canvas, 0, yOffset, canvas.width, height, 0, 0, canvas.width, height);
    }

    doc.addImage(pageCanvas.toDataURL("image/png"), "PNG", 0, 0, pdfWidth, height * ratio);

    yOffset += height;
    pageNum++;
  }

  return doc;
}

/** Triggers a browser download of the summary — used by row/page actions
 *  that want the file saved directly rather than previewed first. */
export async function downloadBookingSummaryPdf(data: BookingSummaryPdfData) {
  const doc = await renderSummaryDoc(data);
  const fileName = `Booking_Summary_${data.clientOrderId}.pdf`;
  const blobUrl = doc.output("bloburl") as unknown as string;
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

/** Blob URL for inline preview (the "View Summary PDF" page embeds this
 *  in an <iframe>, which renders the browser's own native PDF viewer). */
export async function getBookingSummaryPdfBlobUrl(data: BookingSummaryPdfData) {
  const doc = await renderSummaryDoc(data);
  return doc.output("bloburl") as unknown as string;
}
