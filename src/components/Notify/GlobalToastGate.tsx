"use client";

import { usePathname } from "next/navigation";
import ToastProvider from "./ToastProvider";

// Some pages (e.g. Admin Profile) mount their own <Toaster/> and must not
// also receive the global one, since react-hot-toast renders every toast
// on every mounted <Toaster/> instance (duplicate popups otherwise).
const ROUTES_WITH_OWN_TOASTER = ["/admin/profile"];

export default function GlobalToastGate() {
  const pathname = usePathname();
  if (ROUTES_WITH_OWN_TOASTER.includes(pathname)) return null;
  return <ToastProvider />;
}
