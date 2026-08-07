/* -------------------------------------------------------------------------- */
/*                         ROADSHOW CART (client-side)                        */
/* -------------------------------------------------------------------------- */
/*  Vehicle selections are kept in localStorage and never expire on their own: */
/*  only the customer emptying the cart, or a submitted booking request,       */
/*  clears them — a login session ending does not. Each signed-in customer     */
/*  gets their own namespaced key, so two people using the same browser never  */
/*  see each other's selection, and anything picked before signing in lands    */
/*  in a separate guest bucket that is merged into that customer's own cart    */
/*  the moment they sign in. The older single-vehicle sessionStorage draft     */
/*  written by the vehicle details page is still read as a fallback, so a      */
/*  booking started before this change is never lost.                          */

export const CART_KEY_PREFIX = "roadshow_cart_";
export const GUEST_CART_KEY = "guest";
export const LEGACY_DRAFT_KEY = "roadshow_booking_draft";

/* Fired whenever the cart changes so the navbar badge can react in the
   same tab — the native `storage` event only reaches other tabs. */
export const CART_UPDATED_EVENT = "roadshow-cart-updated";

export type CartItem = {
  vehicleId: string;
  startDate: string | null;
  endDate: string | null;
  quantity: number;
};

const isBrowser = (): boolean => typeof window !== "undefined";

const announceCartChange = (): void => {
  if (!isBrowser()) return;

  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
};

/* Builds the storage key for a customer, falling back to a guest bucket */
export const cartKeyFor = (userId?: string | null): string => {
  const id = String(userId ?? "").trim();

  return `${CART_KEY_PREFIX}${id || GUEST_CART_KEY}`;
};

const normalizeItem = (value: unknown): CartItem | null => {
  if (!value || typeof value !== "object") return null;

  const source = value as Record<string, unknown>;

  const vehicleId = String(source.vehicleId ?? "").trim();

  if (!vehicleId) return null;

  return {
    vehicleId,
    startDate: source.startDate ? String(source.startDate) : null,
    endDate: source.endDate ? String(source.endDate) : null,
    quantity: Math.max(Number(source.quantity) || 1, 1),
  };
};

/* Reads one bucket exactly as stored, with no legacy fallback */
const readBucket = (storageKey: string): CartItem[] => {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(storageKey);

    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeItem)
      .filter(Boolean) as CartItem[];
  } catch {
    window.localStorage.removeItem(storageKey);

    return [];
  }
};

/* One entry per vehicle — the incoming dates/quantity win on a clash */
const mergeItems = (
  base: CartItem[],
  incoming: CartItem[]
): CartItem[] => {
  const merged = [...base];

  incoming.forEach((item) => {
    const existingIndex = merged.findIndex(
      (entry) => entry.vehicleId === item.vehicleId
    );

    if (existingIndex >= 0) {
      merged[existingIndex] = item;
    } else {
      merged.push(item);
    }
  });

  return merged;
};

/* Reads a customer's saved cart, falling back to the legacy single draft */
export const readCart = (userId?: string | null): CartItem[] => {
  if (!isBrowser()) return [];

  const items = readBucket(cartKeyFor(userId));

  if (items.length) return items;

  /* Backward compatibility with the pre-cart single-vehicle draft */
  try {
    const legacy = window.sessionStorage.getItem(LEGACY_DRAFT_KEY);

    if (!legacy) return [];

    const item = normalizeItem(JSON.parse(legacy));

    return item ? [item] : [];
  } catch {
    return [];
  }
};

export const writeCart = (
  userId: string | null | undefined,
  items: CartItem[]
): void => {
  if (!isBrowser()) return;

  try {
    const normalized = items
      .map(normalizeItem)
      .filter(Boolean) as CartItem[];

    window.localStorage.setItem(
      cartKeyFor(userId),
      JSON.stringify(normalized)
    );
  } catch {
    /* Storage full or blocked — the in-memory selection still works */
  }

  announceCartChange();
};

/* Total number of vehicles a customer currently has saved */
export const readCartCount = (
  userId?: string | null
): number => readCart(userId).length;

/* Adds a vehicle, or updates it in place when it is already in the cart */
export const addToCart = (
  userId: string | null | undefined,
  item: CartItem
): void => {
  const normalized = normalizeItem(item);

  if (!normalized) return;

  writeCart(
    userId,
    mergeItems(readCart(userId), [normalized])
  );
};

/* Moves anything picked while signed out into that customer's own cart and
   empties the guest bucket, so the next visitor on this browser starts
   clean. Safe to call repeatedly — with nothing to move it is a no-op. */
export const mergeGuestCartInto = (
  userId?: string | null
): CartItem[] => {
  if (!isBrowser()) return [];

  const id = String(userId ?? "").trim();

  const ownCart = readBucket(cartKeyFor(id));

  if (!id) return ownCart;

  const guestCart = readBucket(cartKeyFor(null));

  if (!guestCart.length) return ownCart;

  const merged = mergeItems(ownCart, guestCart);

  try {
    window.localStorage.setItem(
      cartKeyFor(id),
      JSON.stringify(merged)
    );

    window.localStorage.removeItem(cartKeyFor(null));
  } catch {
    /* Storage blocked — fall back to whatever is already saved */
  }

  announceCartChange();

  return merged;
};

export const clearCart = (userId?: string | null): void => {
  if (!isBrowser()) return;

  try {
    window.localStorage.removeItem(cartKeyFor(userId));
    window.sessionStorage.removeItem(LEGACY_DRAFT_KEY);
  } catch {
    /* ignore */
  }

  announceCartChange();
};
