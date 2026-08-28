"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={10}
      containerStyle={{
        /* Higher than any modal/overlay in the app (ReviewOrderModal, the
           campaign-details popups, etc. all sit at 99999–100000) so a toast
           fired while a popup is open — e.g. the PO document size-limit
           error — is never painted behind it. */
        zIndex: 2147483000,
      }}
      toastOptions={{
        duration: 3500,

        style: {
          background: "white",
          color: "black",
          borderRadius: "10px",
          padding: "12px 16px",
          fontSize: "17px",
          fontWeight: 500,
          maxWidth: "420px",
          boxShadow: "0 12px 35px rgba(0, 0, 0, 0.28)",
          whiteSpace: "pre-line",
        },

        success: {
          duration: 3500,
          iconTheme: {
            primary: "#22c55e",
            secondary: "#ffffff",
          },
        },

        error: {
          duration: 4500,
          iconTheme: {
            primary: "#e60023",
            secondary: "#ffffff",
          },
        },

        loading: {
          style: {
            background: "#17171b",
            color: "#ffffff",
          },
        },
      }}
    />
  );
}