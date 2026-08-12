"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, LoaderCircle } from "lucide-react";

import { baseUrl } from "../../../../BaseUrl";
import { useAuth } from "@/context/AuthContext";
import { clientAuthHeaders } from "@/lib/roadshowAuthToken";
import {
  downloadBookingSummaryPdf,
  getBookingSummaryPdfBlobUrl,
  type BookingSummaryPdfData,
} from "@/lib/bookingSummaryPdf";
import "./page.css";

/** The owner's id, whether the endpoint populated it or returned it raw. */
const ownerIdOf = (request: { userId?: string | { _id?: string } | null } | null): string => {
  const owner = request?.userId;

  if (!owner) return "";

  return typeof owner === "object" ? String(owner._id || "") : String(owner);
};

export default function ViewSummaryPdfPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const requestMongoId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const { user, authLoading } = useAuth();

  const [request, setRequest] = useState<BookingSummaryPdfData | null>(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");

  /* Not signed in / still resolving auth are both derived directly from
     `useAuth()` rather than mirrored into local state — the fetch effect
     below never runs for either case, so there is nothing to synchronize. */
  const notSignedIn = !authLoading && !user;
  const loading = authLoading || (Boolean(user) && fetchLoading);

  useEffect(() => {
    if (authLoading || !user) return;

    let active = true;
    let objectUrl = "";

    // Every setState call below lives inside this async callback rather than
    // directly in the effect body, including the "missing id" guard — a
    // synchronous setState call at the top level of an effect can trigger a
    // cascading extra render, which react-hooks' set-state-in-effect rule
    // flags; nesting it here (even though this IIFE still runs immediately)
    // avoids that.
    (async () => {
      try {
        setFetchLoading(true);
        setError("");

        if (!requestMongoId) {
          throw new Error("Booking request ID is missing.");
        }

        const response = await fetch(`${baseUrl}/client-requests/${requestMongoId}`, {
          method: "GET",
          cache: "no-store",
          headers: clientAuthHeaders(),
        });

        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.success || !result?.data) {
          throw new Error(result?.message || "Unable to load the booking summary.");
        }

        const ownerId = ownerIdOf(result.data);

        if (ownerId && ownerId !== String(user._id)) {
          throw new Error("The booking summary could not be found.");
        }

        if (!active) return;

        setRequest(result.data);

        objectUrl = await getBookingSummaryPdfBlobUrl(result.data);

        if (active) setPdfUrl(objectUrl);
      } catch (fetchError) {
        if (active) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to load the booking summary."
          );
        }
      } finally {
        if (active) setFetchLoading(false);
      }
    })();

    return () => {
      active = false;

      // Blob URLs are not garbage-collected automatically — revoke it when
      // this page is left so it doesn't leak memory on repeated visits.
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [requestMongoId, user, authLoading]);

  const handleBack = () => router.push("/roadshow/my-bookings");

  const handleDownload = () => {
    if (request) void downloadBookingSummaryPdf(request);
  };

  return (
    <main className="RS_ViewSummaryRoot min-h-screen bg-white px-4 pb-16 pt-[130px] font-['Outfit'] text-black sm:px-6 sm:pt-[140px] lg:px-8 lg:pt-[150px]">
      <div className="RS_ViewSummaryContainer mx-auto max-w-[1200px]">
        <button
          type="button"
          onClick={handleBack}
          className="RS_ViewSummaryBack inline-flex items-center gap-2 text-[13px] font-medium text-[#6D6D75] transition hover:text-[#111114]"
        >
          <ArrowLeft size={15} />
          Back to Orders
        </button>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-medium tracking-[-0.03em] text-[#0F0F12] sm:text-[34px]">
              View Summary PDF
            </h1>
            <p className="mt-2 text-[14px] text-[#6D6D75]">
              Review and download your booking summary.
            </p>
          </div>

          {request ? (
            <button
              type="button"
              onClick={handleDownload}
              className="RS_ViewSummaryDownload inline-flex h-12 items-center gap-2 rounded-[10px] bg-[#1a1a1c] px-5 text-[13px] font-medium text-white transition hover:bg-[#d70000]"
            >
              <Download size={16} />
              Download
            </button>
          ) : null}
        </div>

        <div className="RS_ViewSummaryPanel mt-6 overflow-hidden rounded-[20px] bg-[#2b2c30] shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-[12px] font-medium text-white/70">
            <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
            <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
            <span className="h-2 w-2 rounded-full bg-[#28c840]" />
            <span className="ml-3 truncate">
              {request ? `Booking_Summary_${request.clientOrderId}.pdf` : "Booking_Summary.pdf"}
            </span>
          </div>

          <div className="RS_ViewSummaryFrame relative h-[75vh] min-h-[520px] bg-[#3a3b40]">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center gap-3 text-[14px] text-white/70">
                <LoaderCircle className="h-5 w-5 animate-spin" />
                Preparing your summary...
              </div>
            ) : notSignedIn ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <p className="text-[14px] text-white/80">
                  Please sign in to view this booking summary.
                </p>
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-[10px] bg-white px-5 py-2.5 text-[13px] font-medium text-black transition hover:bg-white/85"
                >
                  Back to Orders
                </button>
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <p className="text-[14px] text-white/80">{error}</p>
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-[10px] bg-white px-5 py-2.5 text-[13px] font-medium text-black transition hover:bg-white/85"
                >
                  Back to Orders
                </button>
              </div>
            ) : pdfUrl ? (
              <iframe
                src={pdfUrl}
                title="Booking Summary PDF"
                className="h-full w-full border-0"
              />
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
