/* eslint-disable */
// @ts-nocheck
import { Outfit, Geist } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { AuthProvider } from "@/context/AuthContext";
import AuthModal from "@/components/auth/ClientAuthModal";
// import GlobalToastGate from "@/components/Notify/GlobalToastGate";

import Navbar from "@/components/Client/Reusable_Components/Navbar";
import Footer from "@/components/Client/Reusable_Components/Footer";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        />
        {/* OUTFIT FONT  */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap"
          rel="stylesheet"
        />
        {/* Bootstrap CSS - only needed if you're not using Tailwind for everything */}
        {/* <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB"
          crossOrigin="anonymous"
        /> */}

        {/* Merienda FONT  */}

        <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Merienda:wght@300..900&family=Outfit:wght@100..900&display=swap" rel="stylesheet"></link>
      </head>
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <AuthProvider>
          {/* {children} */}

          {/* DO NOT mount GlobalSmoothScroll here.
              This is the ROOT layout, so it also wraps /admin/*. ScrollSmoother
              works by putting a transform on #smooth-content, and a transformed
              ancestor breaks `position: fixed` for every descendant — that would
              take out the admin sidebar, header, backdrop, dropdowns and all ~60
              fixed-positioned modals across the dashboard.
              Smooth scrolling is mounted per public route instead:
                - src/app/roadshow/layout.tsx  (all /roadshow/* pages)
                - src/app/page.tsx             (the homepage, which is not under
                                                the roadshow layout) */}
              {children}

          {/* Bootstrap JS Bundle (includes Popper) - placed before closing body */}
          {/* <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB"
          crossOrigin="anonymous"
          async
        /> */}
          {/* <GlobalToastGate /> */}
          <AuthModal />
        </AuthProvider>

      </body>
    </html>
  );
}