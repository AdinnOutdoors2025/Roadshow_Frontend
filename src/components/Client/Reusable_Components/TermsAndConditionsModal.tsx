"use client";

/* -------------------------------------------------------------------------- */
/*                       TERMS & CONDITIONS  (shared popup)                    */
/* -------------------------------------------------------------------------- */
/*  One shared modal for every "Terms & Conditions" trigger on the public      */
/*  site (Footer, the campaign review popup, and anywhere else that needs      */
/*  it) — same content, same look, so it never drifts between call sites.      */
/*  Purely presentational: the caller owns the open/close state and just       */
/*  renders <TermsAndConditionsModal open={...} onClose={...} />.              */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FileText, X } from "lucide-react";

import { useScrollLock } from "@/hooks/useScrollLock";
import "./TermsAndConditionsModal.css";

type TermsSection = {
  title: string;
  body: string;
};

const TERMS_SECTIONS: TermsSection[] = [
  {
    title: "1. Booking",
    body: "Submitting a booking request does not confirm a booking. All requests are subject to vehicle availability, route feasibility, permissions and Adinn's approval. A booking is confirmed only after formal confirmation by Adinn and the Customer.",
  },
  {
    title: "2. Pricing & Payment",
    body: "Prices shown are subject to final verification based on the campaign requirements. Pricing may vary based on vehicle type, duration, route, location, permissions, manpower, production and other requirements. GST and applicable taxes are extra. No payment is made through this website. Payment terms, including advance payment or PO arrangements, will be communicated separately by Adinn.",
  },
  {
    title: "3. Vehicle & Route",
    body: "Vehicle availability is subject to confirmation. Adinn may provide a suitable alternative vehicle if required due to breakdown, maintenance, safety, regulatory or operational reasons. Routes, locations and timings are subject to traffic, government instructions, permissions, weather and operational conditions. Adinn may make necessary changes and will communicate material changes wherever reasonably practicable.",
  },
  {
    title: "4. Permissions",
    body: "Adinn will handle applicable roadshow permissions within the agreed scope. If a requested location or route cannot be permitted, an alternative may be proposed based on feasibility.",
  },
  {
    title: "5. Customer Responsibility",
    body: "Customers are responsible for the accuracy, legality and necessary approvals of all advertising content and information provided to Adinn. Adinn may reject content that is illegal, misleading, restricted, offensive or infringes third-party rights.",
  },
  {
    title: "6. Campaign Execution",
    body: "Campaign execution may be supported by GPS records, photographs, geo-tagged records and campaign reports. Minor variations in route, timing or movement due to operational or external conditions will not automatically constitute non-performance.",
  },
  {
    title: "7. Cancellation",
    body: "Once a campaign has commenced, the Customer cannot unilaterally cancel it. Where cancellation is accepted, charges for completed days and costs already incurred, including preparation, production and other one-time costs, will remain payable.",
  },
  {
    title: "8. Force Majeure",
    body: "Adinn shall not be liable for delays or interruptions caused by circumstances beyond its reasonable control, including severe weather, accidents, strikes, government restrictions, traffic restrictions, elections, curfews, road closures or public emergencies. Where feasible, alternative or replacement arrangements may be provided.",
  },
];

export default function TermsAndConditionsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mounted] = useState(
    () => typeof document !== "undefined"
  );

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="RS_TncOverlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rs-tnc-title"
      data-lenis-prevent
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="RS_TncModal">
        <header className="RS_TncHeader">
          <span className="RS_TncHeaderIcon">
            <FileText size={18} />
          </span>

          <div className="RS_TncHeaderCopy">
            <h2 id="rs-tnc-title">Terms &amp; Conditions</h2>
            <p>Adinn Advertising Services Ltd.</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="RS_TncClose"
          >
            <X size={18} />
          </button>
        </header>

        <div className="RS_TncIntro">
          By using this website or submitting a roadshow booking request, you
          agree to the following Terms &amp; Conditions of Adinn Advertising
          Services Ltd.
        </div>

        <div className="RS_TncBody">
          {TERMS_SECTIONS.map((section) => (
            <section key={section.title} className="RS_TncSection">
              <h3>{section.title}</h3>
              <p>{section.body}</p>
            </section>
          ))}
        </div>

        <footer className="RS_TncFooter">
          <button type="button" onClick={onClose} className="RS_TncOkBtn">
            I Understand
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
