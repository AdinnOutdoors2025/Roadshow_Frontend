// import { Outfit } from 'next/font/google';
// import './globals.css';
// import "flatpickr/dist/flatpickr.css";
// import { SidebarProvider } from '@/context/SidebarContext';
// import { ThemeProvider } from '@/context/ThemeContext';
// import { SearchProvider } from '@/context/SearchContext';

// const outfit = Outfit({
//   subsets: ["latin"],
// });

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <head>
//         <link
//           rel="stylesheet"
//           href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
//         />
//       </head>
//       <body className={`${outfit.className} dark:bg-gray-900`}>

//         <ThemeProvider>
//           <SidebarProvider>
//             <SearchProvider>
//             {children}
//             </SearchProvider>
//             </SidebarProvider>

//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }


// src/app/layout.tsx
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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className={`${outfit.className} dark:bg-gray-900`}>
        {children}
      </body>
    </html>
  );
}