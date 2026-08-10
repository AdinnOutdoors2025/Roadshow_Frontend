"use client";

import { useEffect, useState } from "react";

import {
  CART_UPDATED_EVENT,
  readCartCount,
} from "@/lib/roadshowCart";

/* Live count of the vehicles a customer has saved in their cart.
   Starts at 0 so the server render and the first client render match,
   then fills in after mount. Reacts to changes made in this tab (via
   CART_UPDATED_EVENT) and in other tabs (via the native storage event). */
export function useCartCount(
  userId?: string | null
): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(readCartCount(userId));

    sync();

    window.addEventListener(CART_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [userId]);

  return count;
}
