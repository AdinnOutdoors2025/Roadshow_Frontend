/* eslint-disable */
// @ts-nocheck
import { Outfit } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";

const outfit = Outfit({
  subsets: ["latin"],
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
      </head>
      <body className={`${outfit.className} dark:bg-gray-900`}>
        {children}

        {/* Bootstrap JS Bundle (includes Popper) - placed before closing body */}
        {/* <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB"
          crossOrigin="anonymous"
          async
        /> */}
      </body>
    </html>
  );
}