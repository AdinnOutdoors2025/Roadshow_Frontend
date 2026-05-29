// src/app/admin/layout.tsx
"use client";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { SearchProvider } from "@/context/SearchContext";
import { useSidebar } from "@/context/SidebarContext";
// import AppHeader from "@/layout/AppHeader";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import Backdrop from "./Backdrop";
import { usePathname } from "next/navigation";
import { VehicleProvider } from "@/context/vehicletypecontext";

const AUTH_PATHS = ["/admin/signin", "/admin/signup"];

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Auth pages: just render children — the (auth)/layout.tsx handles their UI
  if (isAuthPage) {
    return <>{children}</>;
  }

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar />
      <Backdrop />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        <AppHeader />
        <div className="p-2 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <VehicleProvider>
        <SearchProvider>
          <AdminShell>{children}</AdminShell>
        </SearchProvider>
      </VehicleProvider>
    </SidebarProvider>
  </ThemeProvider>
  );
}