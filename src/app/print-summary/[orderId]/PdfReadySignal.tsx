"use client";

import { useEffect } from "react";

/* =========================================================
   PDF-READY SIGNAL — print-summary route only

   Mounted alongside BookingSummaryDocument on the headless-browser-only
   print route (see Utils/bookingSummaryPdfRenderer.js). Once fonts have
   loaded and every <img> on the page has settled (loaded or errored),
   flags the page as ready so Puppeteer can wait on an explicit signal
   instead of racing page.pdf() against network idle.

   Deliberately its own tiny component rather than logic inside
   BookingSummaryDocument.tsx — that component is also rendered directly in
   the browser (html2canvas "Download Summary" flow) and must stay free of
   anything print-route-specific.
========================================================= */

declare global {
  interface Window {
    __BOOKING_SUMMARY_READY__?: boolean;
  }
}

function waitForImages(): Promise<void> {
  const images = Array.from(document.images);

  if (!images.length) return Promise.resolve();

  return Promise.all(
    images.map((img) =>
      img.complete && img.naturalWidth > 0
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          })
    )
  ).then(() => undefined);
}

export default function PdfReadySignal() {
  useEffect(() => {
    let cancelled = false;

    const fontsReady = document.fonts?.ready ?? Promise.resolve();

    Promise.all([fontsReady, waitForImages()]).then(() => {
      if (cancelled) return;

      window.__BOOKING_SUMMARY_READY__ = true;
      document.body.setAttribute("data-booking-summary-ready", "true");
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
