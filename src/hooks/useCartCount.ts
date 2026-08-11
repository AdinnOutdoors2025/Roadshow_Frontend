"use client";

import { useEffect, useState } from "react";

import {
  CART_UPDATED_EVENT,
  readCartCount,
} from "@/lib/roadshowCart";

/* Live count of the vehicles a signed-in customer has saved in their cart.
   Starts at 0 so the server render and the first client render match,
   then fills in after mount. Reacts to changes made in this tab (via
   CART_UPDATED_EVENT) and in other tabs (via the native storage event).

   Signed-out visitors always read 0 — including after a session-expiry or
   idle auto-logout, where the count would otherwise keep showing the
   previous customer's selection to whoever is at the browser next.
   Nothing is discarded: guest picks stay in the guest bucket and are
   merged into the customer's own cart by mergeGuestCartInto at login. */
export function useCartCount(
  userId?: string | null
): number {
  const [count, setCount] = useState(0);

  const id = String(userId ?? "").trim();

  useEffect(() => {
    if (!id) return;

    const sync = () => setCount(readCartCount(id));

    sync();

    window.addEventListener(CART_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [id]);

  /* Derived rather than stored, so a logout hides the badge on the very
     next render instead of waiting for an effect to write 0. */
  return id ? count : 0;
}
