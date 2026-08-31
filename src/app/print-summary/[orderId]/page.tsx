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

  const res = await fetch(`${API_BASE}admin/internal/orders/${orderId}/booking-summary-data`, {
    method: "GET",
    headers: { "x-internal-secret": secret },
    cache: "no-store",
  });

  const result = await res.json().catch(() => null);

  if (!res.ok || !result?.success || !result?.data) return null;

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
