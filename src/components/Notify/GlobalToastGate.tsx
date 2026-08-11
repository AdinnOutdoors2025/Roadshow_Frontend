"use client";

import { usePathname } from "next/navigation";
import ToastProvider from "./ToastProvider";

// react-hot-toast renders every toast on EVERY mounted <Toaster/>, so a page
// that already has its own must not also get the global one — otherwise each
// toast appears twice.
//
// The whole admin dashboard is excluded rather than listed route by route:
// ~13 admin pages/modals mount their own <Toaster position="top-right"/>
// (order-creation, sales-handling, operation-handling, promoter, driver,
// role-permission, invoice-generation, project-setting, profile, …), and a
// hand-maintained allow-list silently starts double-toasting the moment
// someone adds another one. Admin keeps its per-page toasters; the public
// site is served by this global instance.
//
// /roadshow/Contact is the one public exception — it renders a bespoke
// <Toaster/> with its own `contact-toast` styling and colours.
const ROUTES_WITH_OWN_TOASTER = ["/admin", "/roadshow/Contact"];

export default function GlobalToastGate() {
  const pathname = usePathname();

  if (
    ROUTES_WITH_OWN_TOASTER.some((route) => pathname?.startsWith(route))
  ) {
    return null;
  }

  return <ToastProvider />;
}
