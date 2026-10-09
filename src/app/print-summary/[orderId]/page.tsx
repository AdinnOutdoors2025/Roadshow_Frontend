import API_BASE from "../../../../baseurl";
import BookingSummaryDocument from "@/lib/BookingSummaryDocument";
import { resolveVehicleImages, type BookingSummaryPdfData } from "@/lib/bookingSummaryPdf";
import PdfReadySignal from "./PdfReadySignal";

/* =========================================================
   PRINT-ONLY BOOKING SUMMARY ROUTE

   Not meant for real users — this exists so the backend's headless
   Puppeteer renderer (Utils/bookingSummaryPdfRenderer.js) can navigate
   here and print the exact same BookingSummaryDocument.tsx template the
   browser "Download Summary" flow rasterizes, for every order (admin or
   customer-created) before the campaign-request mail fires. Deliberately
   outside /roadshow and /admin so it renders with no Navbar/Footer/admin
   chrome — nothing but the document itself.
========================================================= */

export const dynamic = "force-dynamic";

async function fetchBookingSummaryData(orderId: string): Promise<BookingSummaryPdfData | null> {
  const secret = process.env.INTERNAL_API_SECRET || "";
  const url = `${API_BASE}admin/internal/orders/${orderId}/booking-summary-data`;

  /* A network-level failure (unreachable INTERNAL_API_BASE, DNS, refused
     connection) used to throw here and 500 the whole route — Puppeteer then
     never saw PdfReadySignal and the campaign mail went out with no PDF.
     Degrade to the "not found" page instead, and log why. */
  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      headers: { "x-internal-secret": secret },
      cache: "no-store",
    });
  } catch (error) {
    console.error(`print-summary: fetch failed for ${url} —`, (error as Error)?.message);
    return null;
  }

  const result = await res.json().catch(() => null);

  if (!res.ok || !result?.success || !result?.data) {
    console.error(`print-summary: ${url} -> ${res.status} ${result?.message || ""}`);
    return null;
  }

  return result.data as BookingSummaryPdfData;
}

export default async function PrintBookingSummaryPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const data = await fetchBookingSummaryData(orderId);

  if (!data) {
    return (
      <>
        <PdfReadySignal />
        <div>Booking summary not found.</div>
      </>
    );
  }

  const vehicleImages = await resolveVehicleImages(data.vehicleTypes || []);

  return (
    <>
      {/* Puppeteer's PDF capture must never show a mid-transition frame —
          this route is only ever screenshotted once, so there is nothing
          for an animation/transition to usefully do here. */}
      <style>{`*, *::before, *::after { animation: none !important; transition: none !important; }`}</style>
      <PdfReadySignal />
      <BookingSummaryDocument data={data} vehicleImages={vehicleImages} />
    </>
  );
}
