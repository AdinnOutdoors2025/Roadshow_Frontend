"use client";

import { usePathname } from "next/navigation";
import ToastProvider from "./ToastProvider";
import ContactToastProvider from "./ContactToastProvider";

// react-hot-toast renders every toast on EVERY mounted <Toaster/>, so a page
// must get exactly one toaster mounted for it somewhere — never zero, never
// two.
//
// The whole admin dashboard is excluded rather than listed route by route:
// ~13 admin pages/modals mount their own <Toaster position="top-right"/>
// (order-creation, sales-handling, operation-handling, promoter, driver,
// role-permission, invoice-generation, project-setting, profile, …), and a
// hand-maintained allow-list silently starts double-toasting the moment
// someone adds another one. Admin keeps its per-page toasters; the public
// site is served from here.
//
// /roadshow/Contact gets its own bespoke `contact-toast` styling (pill
// shape, custom colours/duration) via ContactToastProvider below — it used
// to render that <Toaster/> inline inside the page itself, but the page is
// nested inside GlobalSmoothScroll's transformed #smooth-content wrapper
// (see roadshow/layout.tsx), and a transformed ancestor breaks
// `position: fixed` for everything inside it — no z-index could ever get
// the toast above the Navbar (which portals to document.body specifically
// to escape that same trap). Mounting it here, at root level alongside
// Navbar/GlobalRoadshowLoader, fixes that structurally instead.
const ADMIN_ROUTE_PREFIX = "/admin";
const CONTACT_ROUTE = "/roadshow/Contact";

export default function GlobalToastGate() {
  const pathname = usePathname();

  if (pathname?.startsWith(ADMIN_ROUTE_PREFIX)) {
    return null;
  }

  if (pathname?.startsWith(CONTACT_ROUTE)) {
    return <ContactToastProvider />;
  }

  return <ToastProvider />;
}
