import type { ReactNode } from "react";
import { Geist, Outfit } from "next/font/google";

import "./globals.css";
import "flatpickr/dist/flatpickr.css";

import GlobalRoadshowLoader from "@/components/GlobalRoadshowLoader";
import AuthModal from "@/components/auth/ClientAuthModal";
import GlobalToastGate from "@/components/Notify/GlobalToastGate";
import { AuthProvider } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
});

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", geist.variable)}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Merienda:wght@300..900&family=Outfit:wght@100..900&display=swap"
        />
      </head>

      <body className={`${outfit.className} dark:bg-gray-900`}>
        <AuthProvider>
          {children}

          {/* Mount the loader exactly once for the complete application. */}
          <GlobalRoadshowLoader />

          <GlobalToastGate />
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}