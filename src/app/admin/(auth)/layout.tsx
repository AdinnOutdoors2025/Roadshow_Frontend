// // src/app/admin/(auth)/layout.tsx
// import GridShape from "@/components/common/GridShape";
// import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
// import { ThemeProvider } from "@/context/ThemeContext";
// import Image from "next/image";
// import Link from "next/link";
// import React from "react";

// export default function AuthLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <ThemeProvider>
//       {/* This full-screen wrapper replaces the sidebar shell for auth pages */}
//       <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
//         <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col dark:bg-gray-900 sm:p-0">
//           {children}
//           <div className="lg:w-1/2 w-full h-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden">
//             <div className="relative items-center justify-center flex z-1">
//               <GridShape />
//               <div className="flex flex-col items-center max-w-xs">
//                 <Link href="/" className="block mb-4">
//                   <Image
//                     width={231}
//                     height={48}
//                     src="/images/logo/AdinnLogo.png"
//                     alt="Logo"
//                   />
//                 </Link>
//                 <p className="text-center text-gray-400 dark:text-white/60">
//                   Adinn Roadshows | Admin Dashboard
//                 </p>
//               </div>
//             </div>
//           </div>
//           <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
//             <ThemeTogglerTwo />
//           </div>
//         </div>
//       </div>
//     </ThemeProvider>
//   );
// }


// src/app/admin/(auth)/layout.tsx

import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <div className="relative min-h-screen bg-white dark:bg-gray-900">
        <div className="flex min-h-screen w-full">

          <div className="flex min-h-screen w-full lg:w-1/2">
            {children}
          </div>

      
          <div className="relative hidden min-h-screen w-1/2 overflow-hidden bg-[#030817] lg:block">

            <Image
              src="/images/loginpage.png"
              alt="Adinn Roadshows Admin Dashboard"
              fill
              priority
              sizes="50vw"
              className="object-cover object-center"
            />

       
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5" />

         
            <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-white/10" />
          </div>
        </div>

    
        <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </ThemeProvider>
  );
}