import { Outfit } from "next/font/google";

import Navbar from "@/components/Client/Reusable_Components/Navbar";
import Footer from "@/components/Client/Reusable_Components/Footer";
import GlobalSmoothScroll from "@/components/GlobalSmoothScroll";

import "./globals.css";

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
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        />
      </head>

      <body className={`${outfit.className} relative dark:bg-gray-900`}>
        {/* Only global Navbar */}
        <Navbar />

        {/* Smooth scrolling for every website page */}
        <GlobalSmoothScroll>
          <main className="relative min-h-screen w-full">
            {children}
          </main>

          {/* Only global Footer */}
          <Footer />
        </GlobalSmoothScroll>
      </body>
    </html>
  );
}