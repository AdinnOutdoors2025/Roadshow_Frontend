import { Outfit } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { SearchProvider } from '@/context/SearchContext';
import { VehicleProvider } from '@/context/vehicletypecontext';

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
      </head>
      <body className={`${outfit.className} dark:bg-gray-900`}>
         
        <ThemeProvider>
          <VehicleProvider>
          <SidebarProvider>
            <SearchProvider>
            {children}
            </SearchProvider>
            </SidebarProvider>
         </VehicleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
