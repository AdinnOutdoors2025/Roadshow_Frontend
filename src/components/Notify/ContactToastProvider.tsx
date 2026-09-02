"use client";

import { Toaster } from "react-hot-toast";

/* Mounted at root level by GlobalToastGate for /roadshow/Contact — see the
   comment there for why. Same bespoke pill-shaped styling the page used to
   render inline via its own <Toaster/>, just relocated outside
   GlobalSmoothScroll's transformed wrapper so position: fixed actually
   works. */
export default function ContactToastProvider() {
  return (
    <Toaster
      position="top-center"
      containerClassName="contact-toast-container"
      toastOptions={{
        duration: 4200,

        className: "contact-toast",

        success: {
          iconTheme: {
            primary: "#16784a",
            secondary: "#ffffff",
          },
        },

        error: {
          iconTheme: {
            primary: "#a52b2b",
            secondary: "#ffffff",
          },
        },
      }}
    />
  );
}
