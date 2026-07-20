// src/app/layout.tsx
"use client";
import { Outfit } from "next/font/google";
import GlobalSmoothScroll from "@/components/GlobalSmoothScroll";
import "lenis/dist/lenis.css";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${outfit.className} dark:bg-gray-900 relative`}>
        {/* Apply smooth scrolling to all pages */}
        <GlobalSmoothScroll />

        {/* Render all page children */}
        {children}
      </body>
    </html>
  );
}