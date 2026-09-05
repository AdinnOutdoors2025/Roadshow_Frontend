"use client";

import "./WhatsAppFloatButton.css";
import { NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER } from "../../../BaseUrl";


/* Sourced from NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER (see .env). A bare 10-digit
   Indian number is normalized to the full country-coded form wa.me expects. */
// const rawAdminNumber = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER || "7200220645";
const rawAdminNumber = `${NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER}`
const adminNumberDigits = rawAdminNumber.replace(/\D/g, "");
const WHATSAPP_NUMBER =
  adminNumberDigits.length === 10
    ? `91${adminNumberDigits}`
    : adminNumberDigits;

const WHATSAPP_MESSAGE =
  "Hi, I visited the Adinn Roadshows website (adinnroadshows.com) and would like to know more about your roadshow services.";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_MESSAGE,
)}`;

export default function WhatsAppFloatButton() {
  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
      className="RS_WhatsAppFloat"
      data-loader="false"
    >
      <svg
        viewBox="0 0 32 32"
        width="30"
        height="30"
        aria-hidden="true"
        fill="currentColor"
      >
        <path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.34.66 4.523 1.804 6.383L4 29l7.805-1.767A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.75a9.7 9.7 0 0 1-4.95-1.356l-.355-.21-4.633 1.05 1.08-4.512-.232-.368A9.71 9.71 0 0 1 5.25 15c0-5.936 4.818-10.75 10.754-10.75S26.75 9.064 26.75 15 21.94 24.75 16.004 24.75Zm5.545-7.373c-.303-.152-1.792-.884-2.07-.985-.278-.101-.48-.152-.683.152-.202.303-.783.985-.96 1.187-.176.202-.353.227-.656.076-.303-.152-1.278-.471-2.435-1.503-.9-.803-1.508-1.795-1.685-2.098-.176-.303-.019-.467.133-.618.136-.136.303-.353.455-.53.152-.176.202-.303.303-.505.101-.202.05-.379-.025-.53-.076-.152-.683-1.647-.936-2.256-.246-.593-.497-.513-.683-.522l-.581-.01c-.202 0-.53.076-.808.379-.278.303-1.06 1.036-1.06 2.526s1.085 2.93 1.237 3.132c.152.202 2.135 3.26 5.174 4.572.723.312 1.287.499 1.727.638.726.231 1.386.198 1.908.12.582-.087 1.792-.733 2.045-1.44.253-.708.253-1.314.177-1.44-.076-.126-.278-.202-.581-.353Z" />
      </svg>
    </a>
  );
}
