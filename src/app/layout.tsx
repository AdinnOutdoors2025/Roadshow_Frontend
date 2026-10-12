import type { ReactNode } from "react";
import { Geist, Outfit } from "next/font/google";
import Script from "next/script";

import "./globals.css";
import "flatpickr/dist/flatpickr.css";

import GlobalRoadshowLoader from "@/components/GlobalRoadshowLoader";
import AuthModal from "@/components/auth/ClientAuthModal";
import GlobalToastGate from "@/components/Notify/GlobalToastGate";
import { AuthProvider } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
const SITE_URL = "https://www.adinnroadshows.com";

const GOOGLE_ANALYTICS_ID = "G-SVL3CWLJZF";
const GOOGLE_TAG_MANAGER_ID = "GTM-T2MDR4W";
const MICROSOFT_CLARITY_ID = "qu4xyuprxg";

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


         {/* Direct Google Analytics GA4 library */}
        <Script
          id="google-analytics-library"
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
          strategy="afterInteractive"
        />

        {/* Direct Google Analytics GA4 configuration */}
        <Script
          id="google-analytics-config"
          strategy="afterInteractive"
        >
          {`
            window.dataLayer =
              window.dataLayer || [];

            function gtag() {
              window.dataLayer.push(arguments);
            }

            window.gtag = gtag;

            gtag('js', new Date());

            gtag(
              'config',
              '${GOOGLE_ANALYTICS_ID}',
              {
                anonymize_ip: true,
                send_page_view: true
              }
            );
          `}
        </Script>

        {/* Microsoft Clarity */}
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
        >
          {`
            (function(c,l,a,r,i,t,y){
              c[a] = c[a] || function(){
                (c[a].q = c[a].q || [])
                  .push(arguments);
              };

              t = l.createElement(r);
              t.async = 1;
              t.src =
                "https://www.clarity.ms/tag/" +
                i;

              y = l.getElementsByTagName(r)[0];

              y.parentNode.insertBefore(t, y);
            })(
              window,
              document,
              "clarity",
              "script",
              "${MICROSOFT_CLARITY_ID}"
            );
          `}
        </Script>


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