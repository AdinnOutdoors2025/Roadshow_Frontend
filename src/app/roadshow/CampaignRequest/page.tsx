/* eslint-disable */
// @ts-nocheck
"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, } from "react";
import { createPortal } from "react-dom";
import { useScrollLock } from "@/hooks/useScrollLock";
import { isBefore } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Minus, Plus, Send, SquarePen, Trash2, X, } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

import DatePicker from "@/components/calendar/calendar_reusable/calender";
import { ButtonHover as VehicleCrfSubmitBtn } from "@/components/Client/Reusable_Components/ButtonHover";
import { ButtonHover as VehicleCrfAddMoreVehBtn } from "@/components/Client/Reusable_Components/ButtonHover";
import '../../../components/Client/HomePageSections/HomePageSection1.css';

import { useModal } from "@/hooks/useModal";
import { useAuth } from "@/context/AuthContext";
import { clientAuthHeaders } from "@/lib/roadshowAuthToken";
import { FALLBACK_VEHICLE_IMAGE, fetchAllRoadshowVehicles, type RoadshowVehicle, } from "@/lib/roadshowVehicles";
import { clearCart, mergeGuestCartInto, readCart, writeCart, type CartItem, } from "@/lib/roadshowCart";
import { AnimatePresence, motion } from "framer-motion";
import { GST_Percentage } from '../../../BaseUrl'
import "./page.css";
import { formatCurrency, formatDate, formatDateForApi, getInclusiveDayCount, parseStoredDate, toSafeDate, toSafeNumber, } from "@/app/utils/currency";
import { useRouter } from "next/navigation";
import { baseUrl } from "../../../BaseUrl";
type SelectedVehicle = RoadshowVehicle & {
  startDate: Date | null;
  endDate: Date | null;
  quantity: number;
};

/* The earliest date an over-booked vehicle type frees up again.

   Registrations that are currently unavailable carry either an explicit
   `availableFrom` (set when staff mark one Unavailable) or a booking window
   whose `toDate` is the last committed day — so the day after it is the first
   free one. The soonest of those is the useful answer: it is when the NEXT
   vehicle of this type comes back, not when all of them do.

   Returns null when nothing is dated, in which case the caller shows the
   plain "our team will confirm" wording instead of inventing a date. */
const getNextAvailableDate = (
  vehicle: SelectedVehicle
): Date | null => {
  const registrations = Array.isArray(
    vehicle?.registrationVehicles
  )
    ? vehicle.registrationVehicles
    : [];

  const candidates: Date[] = [];

  registrations.forEach((registration) => {
    const status = String(
      registration?.statusAvailability?.currentStatus || ""
    )
      .trim()
      .toLowerCase();

    /* Already bookable — it is not what the customer is waiting on */
    if (
      status === "available" &&
      registration?.activeStatus !== false
    ) {
      return;
    }

    const availableFrom = toSafeDate(
      registration?.statusAvailability?.availableFrom
    );

    if (availableFrom) {
      candidates.push(availableFrom);

      return;
    }

    const bookedUntil = toSafeDate(
      registration?.statusAvailability?.toDate
    );

    if (bookedUntil) {
      candidates.push(
        new Date(bookedUntil.getTime() + 86400000)
      );
    }
  });

  if (!candidates.length) return null;

  return candidates.reduce((earliest, current) =>
    current < earliest ? current : earliest
  );
};

/* CAMPAIGN REQUEST PAGE */
export default function CampaignRequestPage() {
  const router = useRouter();
  const { user, openAuth, authLoading, isAgency } = useAuth();

  /* Agencies verified their GST at signup — nothing here is re-typed */
  const agencyBusiness = isAgency ? user?.business || null : null;

  const productScrollerRef =
    useRef<HTMLDivElement>(null);

  const cardNodesRef = useRef(
    new Map<string, HTMLElement>()
  );

  /* Offsets, not DOMRects: getBoundingClientRect() is viewport-relative, so
     horizontally scrolling the carousel between two reorders made every card
     look like it had moved by the scroll distance and fly in from off-screen.
     offsetLeft/offsetTop are measured against the offset parent and are
     unaffected by scrolling. */
  const cardPositionsRef = useRef(
    new Map<string, { left: number; top: number }>()
  );

  /* Selected cards sort to the front of the row, so adding one while the
     carousel is scrolled right pushes it off-screen to the left — it looks
     like the card vanished. This holds the id just added so the carousel can
     scroll it back into view once the reorder has been laid out. */
  const lastAddedVehicleIdRef = useRef<
    string | null
  >(null);

  const leftColumnRef =
    useRef<HTMLElement>(null);

  const rightColumnRef =
    useRef<HTMLElement>(null);

  const authPromptedRef = useRef(false);

  /* Guards the cart-persist effect until the saved cart has been restored */
  const cartHydratedRef = useRef(false);

  /* Which customer's cart is currently loaded into selectedVehicles */
  const cartUserKeyRef = useRef<string | null>(null);

  /* Saved rows the current catalogue response didn't return — kept so the
     persist effect can write them back instead of dropping them */
  const unmatchedCartRef = useRef<CartItem[]>([]);

  /* The exact array hydration handed to state, so the persist effect can
     tell it apart from the previous customer's stale selection */
  const hydratedSelectionRef = useRef<SelectedVehicle[] | null>(null);

  const [vehicles, setVehicles] = useState<
    RoadshowVehicle[]
  >([]);

  const [
    selectedVehicles,
    setSelectedVehicles,
  ] = useState<SelectedVehicle[]>([]);

  const [
    activeDateVehicleId,
    setActiveDateVehicleId,
  ] = useState<string | null>(null);

  const [
    loadingVehicles,
    setLoadingVehicles,
  ] = useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const {
    isOpen: isReviewOpen,
    openModal: openReviewModal,
    closeModal: closeReviewModal,
  } = useModal();

  useScrollLock(isReviewOpen);

  useEffect(() => {
    if (!isReviewOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeReviewModal();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isReviewOpen, closeReviewModal]);

  const [canScrollLeft, setCanScrollLeft] =
    useState(false);

  const [canScrollRight, setCanScrollRight] =
    useState(false);

  const [clientDetails, setClientDetails] =
    useState({
      name: "",
      phone: "",
      email: "",
    });

  /* Logged-in customer information */
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      if (!authPromptedRef.current) {
        authPromptedRef.current = true;

        toast.error(
          "Please login to continue booking.",
          {
            id: "campaign-login-required",
          }
        );

        openAuth("login");
      }

      return;
    }

    authPromptedRef.current = false;

    setClientDetails({
      name: user?.name || "",
      phone: user?.phone || "",
      email: user?.email || "",
    });
  }, [user, authLoading, openAuth]);

  /* Load all campaign vehicles through API */
  useEffect(() => {
    let componentMounted = true;

    const loadVehicles = async () => {
      try {
        setLoadingVehicles(true);

        const apiVehicles =
          await fetchAllRoadshowVehicles();

        if (!componentMounted) return;

        setVehicles(apiVehicles || []);

      } catch (error) {
        console.error(
          "Campaign vehicle loading error:",
          error
        );

        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load campaign vehicles."
        );
      } finally {
        if (componentMounted) {
          setLoadingVehicles(false);
        }
      }
    };

    loadVehicles();

    return () => {
      componentMounted = false;
    };
  }, []);

  /* Restore the signed-in customer's own cart once the vehicle list and the
     auth session are both resolved. Re-runs when the customer changes, so
     signing in as someone else swaps in that person's saved selection. */
  useEffect(() => {
    if (authLoading) return;
    if (!vehicles.length) return;

    const userKey = String(user?._id || "guest");

    if (
      cartHydratedRef.current &&
      cartUserKeyRef.current === userKey
    ) {
      return;
    }

    /* Anything picked before signing in joins this customer's own cart */
    const savedCart = user?._id
      ? mergeGuestCartInto(user._id)
      : readCart(user?._id);

    const restoredVehicles = savedCart
      .map((item) => {
        const matchedVehicle = vehicles.find(
          (vehicle) =>
            String(vehicle.id) ===
            String(item.vehicleId)
        );

        if (!matchedVehicle) return null;

        return {
          ...matchedVehicle,
          startDate: parseStoredDate(
            item.startDate
          ),
          endDate: parseStoredDate(
            item.endDate
          ),
          quantity: Math.max(
            Number(item.quantity || 1),
            1
          ),
        };
      })
      .filter(Boolean) as SelectedVehicle[];

    /* A vehicle missing from this catalogue response (temporarily hidden,
       or the request failed part way) must not silently erase the saved
       row — hold it aside and write it back untouched. */
    const restoredIds = new Set(
      restoredVehicles.map((vehicle) =>
        String(vehicle.id)
      )
    );

    unmatchedCartRef.current = savedCart.filter(
      (item) =>
        !restoredIds.has(String(item.vehicleId))
    );

    hydratedSelectionRef.current = restoredVehicles;

    setSelectedVehicles(restoredVehicles);

    cartUserKeyRef.current = userKey;
    cartHydratedRef.current = true;
  }, [vehicles, user, authLoading]);

  /* Persist the on-screen selection against the current customer. Held back
     until that customer's cart has been restored, otherwise the initial
     empty selection — or, on a customer switch, the previous customer's
     still-rendered selection — would overwrite what they had saved. */
  useEffect(() => {
    const userKey = String(user?._id || "guest");

    if (!cartHydratedRef.current) return;
    if (cartUserKeyRef.current !== userKey) return;

    /* Both effects react to `user`, and this one runs in the same commit as
       hydration, before React has applied the restored list. Wait for that
       exact array to arrive before writing anything. */
    if (hydratedSelectionRef.current) {
      if (
        selectedVehicles !==
        hydratedSelectionRef.current
      ) {
        return;
      }

      hydratedSelectionRef.current = null;
    }

    writeCart(user?._id, [
      ...selectedVehicles.map((vehicle) => ({
        vehicleId: String(vehicle.id),
        startDate: vehicle.startDate
          ? formatDateForApi(vehicle.startDate)
          : null,
        endDate: vehicle.endDate
          ? formatDateForApi(vehicle.endDate)
          : null,
        quantity: vehicle.quantity,
      })),
      ...unmatchedCartRef.current,
    ]);
  }, [selectedVehicles, user]);

  const selectedVehicleIds = useMemo(
    () =>
      new Set(
        selectedVehicles.map(
          (vehicle) => vehicle.id
        )
      ),
    [selectedVehicles]
  );

  const sortedVehicles = useMemo(() => {
    return [...vehicles].sort((a, b) => {
      const aSelected = selectedVehicleIds.has(a.id) ? 0 : 1;
      const bSelected = selectedVehicleIds.has(b.id) ? 0 : 1;

      return aSelected - bSelected;
    });
  }, [vehicles, selectedVehicleIds]);

  /* FLIP animation: slide cards to their new spot instead of jumping.
     Every card is put back at its previous offset with the transition off,
     then released on the next frame so the browser animates the difference. */
  useLayoutEffect(() => {
    const newPositions = new Map<
      string,
      { left: number; top: number }
    >();

    cardNodesRef.current.forEach((node, id) => {
      newPositions.set(id, {
        left: node.offsetLeft,
        top: node.offsetTop,
      });
    });

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    /* Cleanups for cards still mid-slide, so a reorder that lands while an
       earlier one is running does not leave stale listeners behind. */
    const cleanups: Array<() => void> = [];

    if (!prefersReducedMotion) {
      newPositions.forEach((newPosition, id) => {
        const oldPosition =
          cardPositionsRef.current.get(id);
        const node = cardNodesRef.current.get(id);

        if (!oldPosition || !node) return;

        const deltaX = oldPosition.left - newPosition.left;
        const deltaY = oldPosition.top - newPosition.top;

        /* Sub-pixel drift from zoom or a scrollbar appearing would otherwise
           kick off a pointless transition on every card in the row. */
        if (
          Math.abs(deltaX) < 1 &&
          Math.abs(deltaY) < 1
        ) {
          return;
        }

        node.style.willChange = "transform";
        node.style.transition = "none";
        node.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        const frameId = requestAnimationFrame(() => {
          node.style.transition =
            "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)";
          node.style.transform = "";
        });

        /* Clear the inline styles once the slide finishes. Without this the
           inline `transition` keeps overriding the card's own stylesheet
           transitions (hover lift, shadow) for the rest of the session. */
        const handleTransitionEnd = (
          event: TransitionEvent
        ) => {
          if (event.propertyName !== "transform") return;

          node.style.transition = "";
          node.style.transform = "";
          node.style.willChange = "";

          node.removeEventListener(
            "transitionend",
            handleTransitionEnd
          );
        };

        node.addEventListener(
          "transitionend",
          handleTransitionEnd
        );

        cleanups.push(() => {
          cancelAnimationFrame(frameId);

          node.removeEventListener(
            "transitionend",
            handleTransitionEnd
          );
        });
      });
    }

    cardPositionsRef.current = newPositions;

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [sortedVehicles]);

  /* Bring newly added cards back into view. Runs after the FLIP layout effect
     has reordered the row. */
  useEffect(() => {
    const vehicleId =
      lastAddedVehicleIdRef.current;

    if (!vehicleId) return;

    lastAddedVehicleIdRef.current = null;

    const scroller = productScrollerRef.current;

    if (!scroller) return;

    /* Rewind the row to the very start rather than to the added card itself.
       Selected cards sort to the front, so the start is where they all live —
       and landing on an exact card boundary is what stops the row settling
       mid-card and leaving a sliced-off card at the left edge. */
    const target = 0;

    /* Already parked there — don't jolt the row for a sub-pixel difference. */
    if (
      Math.abs(scroller.scrollLeft - target) < 2
    ) {
      return;
    }

    const prefersReducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    scroller.scrollTo({
      left: target,
      behavior: prefersReducedMotion
        ? "auto"
        : "smooth",
    });
  }, [sortedVehicles]);

  /* Paired-column scrolling.

     Each column is sticky with a `top` derived from its own height:

       - Column SHORTER than the viewport -> top = TOP_GAP. It pins as soon as
         it reaches the navbar and then waits, so it stays on screen instead of
         leaving a block of dead whitespace while the other side scrolls on.

       - Column TALLER than the viewport -> top = viewport - height - gap,
         which is negative. Sticky then lets the column scroll all the way
         through its own content first and only pins once its bottom edge
         reaches the bottom of the viewport. This is what keeps "Add More
         Vehicle" and "Review & Submit" reachable — a plain `top: 96px` would
         pin the column immediately and strand everything below the fold.

     Net effect: the shorter side finishes and holds, the taller side keeps
     scrolling, and once both are exhausted the page scrolls on as one.

     Recomputed whenever either column changes height (adding or removing a
     vehicle does exactly that), which is why this is measured rather than
     expressed as a static CSS rule. */
  useEffect(() => {
    const leftColumn = leftColumnRef.current;
    const rightColumn = rightColumnRef.current;

    if (!leftColumn || !rightColumn) return;

    const TOP_GAP = 96;
    const BOTTOM_GAP = 24;
    const DESKTOP_MIN_WIDTH = 1024;

    const applyStickyOffsets = () => {
      const columns = [leftColumn, rightColumn];

      /* Below lg the grid is a single column and the page just scrolls. */
      if (
        window.innerWidth < DESKTOP_MIN_WIDTH
      ) {
        columns.forEach((column) => {
          column.style.position = "";
          column.style.top = "";
        });

        return;
      }

      columns.forEach((column) => {
        const height = column.offsetHeight;
        const viewportHeight = window.innerHeight;

        const overflowsViewport =
          height + TOP_GAP + BOTTOM_GAP >
          viewportHeight;

        const top = overflowsViewport
          ? viewportHeight - height - BOTTOM_GAP
          : TOP_GAP;

        column.style.position = "sticky";
        column.style.top = `${top}px`;
      });
    };

    applyStickyOffsets();

    /* Setting position/top does not change offsetHeight, so observing the same
       elements we write to cannot feed back into itself. */
    const resizeObserver = new ResizeObserver(
      applyStickyOffsets
    );

    resizeObserver.observe(leftColumn);
    resizeObserver.observe(rightColumn);

    window.addEventListener(
      "resize",
      applyStickyOffsets
    );

    return () => {
      resizeObserver.disconnect();

      window.removeEventListener(
        "resize",
        applyStickyOffsets
      );
    };
  }, []);

  const activeDateVehicle = useMemo(
    () =>
      selectedVehicles.find(
        (vehicle) =>
          vehicle.id ===
          activeDateVehicleId
      ),
    [
      selectedVehicles,
      activeDateVehicleId,
    ]
  );

  const isSelected = (
    vehicleId: string
  ) => {
    return selectedVehicleIds.has(
      vehicleId
    );
  };

  const toggleVehicle = (
    vehicle: RoadshowVehicle
  ) => {
    /* Read before the state update so this is a plain derived value rather
       than a side effect inside the updater (which React may run twice). */
    /* Stored raw, not String(...): cardNodesRef is keyed by vehicle.id as-is,
       so coercing here would miss the lookup for any non-string id. */
    lastAddedVehicleIdRef.current = isSelected(
      vehicle.id
    )
      ? null
      : vehicle.id;

    const removingVehicle = isSelected(
      vehicle.id
    );

    setSelectedVehicles((current) => {
      const alreadySelected = current.some(
        (item) =>
          String(item.id) ===
          String(vehicle.id)
      );

      if (alreadySelected) {
        return current.filter(
          (item) =>
            String(item.id) !==
            String(vehicle.id)
        );
      }

      const firstSelected = current[0];

      const directRate = toSafeNumber(
        vehicle.rate
      );

      const packageRate = toSafeNumber(
        vehicle.packageDetails
          ?.perDayRentalCost
      );

      return [
        ...current,
        {
          ...vehicle,

          rate:
            directRate > 0
              ? directRate
              : packageRate,

          startDate:
            firstSelected?.startDate ||
            null,

          endDate:
            firstSelected?.endDate ||
            null,

          quantity: 1,
        },
      ];
    });

    if (removingVehicle) {
      toast.success(
        `${vehicle.name} removed from your campaign.`,
        {
          id: `vehicle-toggle-${vehicle.id}`,
        }
      );
    } else {
      toast.success(
        `${vehicle.name} added. Select your dates, then continue to Campaign Details.`,
        {
          id: `vehicle-toggle-${vehicle.id}`,
        }
      );
    }
  };

  const removeVehicle = (
    vehicleId: string
  ) => {
    const vehicleToRemove = selectedVehicles.find(
      (vehicle) =>
        String(vehicle.id) === String(vehicleId)
    );

    setSelectedVehicles((current) =>
      current.filter(
        (vehicle) =>
          String(vehicle.id) !== String(vehicleId)
      )
    );

    toast.success(
      vehicleToRemove
        ? `${vehicleToRemove.name} removed from your campaign.`
        : "Vehicle removed from your campaign.",
      {
        id: `vehicle-removed-${vehicleId}`,
      }
    );
  };

  const updateSelectedVehicle = (
    vehicleId: string,
    updates: Partial<SelectedVehicle>
  ) => {
    setSelectedVehicles((current) =>
      current.map((vehicle) =>
        vehicle.id === vehicleId
          ? {
            ...vehicle,
            ...updates,
          }
          : vehicle
      )
    );
  };

  const replaceSelectedVehicle = (
    currentVehicleId: string,
    nextVehicleId: string
  ) => {
    if (
      currentVehicleId === nextVehicleId
    ) {
      return;
    }

    if (isSelected(nextVehicleId)) {
      toast.error(
        "This vehicle is already added."
      );

      return;
    }

    const nextVehicle = vehicles.find(
      (vehicle) =>
        vehicle.id === nextVehicleId
    );

    if (!nextVehicle) return;

    setSelectedVehicles((current) =>
      current.map((vehicle) => {
        if (
          vehicle.id !== currentVehicleId
        ) {
          return vehicle;
        }

        return {
          ...nextVehicle,
          startDate:
            vehicle.startDate,
          endDate: vehicle.endDate,
          quantity: vehicle.quantity,
        };
      })
    );
  };

  const bookingRows = useMemo(() => {
    return selectedVehicles.map(
      (vehicle) => {
        const days = getInclusiveDayCount(
          vehicle.startDate,
          vehicle.endDate
        );

        const quantity = Math.max(
          Math.floor(
            toSafeNumber(vehicle.quantity)
          ),
          1
        );

        const directRate = toSafeNumber(
          vehicle.rate
        );

        const packageRate = toSafeNumber(
          vehicle.packageDetails
            ?.perDayRentalCost
        );

        const rate =
          directRate > 0
            ? directRate
            : packageRate;

        const total =
          rate * days * quantity;

        return {
          ...vehicle,
          rate,
          days,
          quantity,
          total: Number.isFinite(total)
            ? total
            : 0,
        };
      }
    );
  }, [selectedVehicles]);

  const grandTotal = useMemo(() => {
    return bookingRows.reduce(
      (total, vehicle) =>
        total +
        toSafeNumber(vehicle.total),
      0
    );
  }, [bookingRows]);

  const GST_PERCENT = parseFloat(GST_Percentage);

  const gstAmount = useMemo(() => {
    return grandTotal * (GST_PERCENT / 100);
  }, [grandTotal, GST_PERCENT]);

  const estimatedTotal = useMemo(() => {
    return grandTotal + gstAmount;
  }, [grandTotal, gstAmount]);

  const reviewCompanyName =
    agencyBusiness?.business_name ||
    user?.companyName ||
    user?.company ||
    user?.organizationName ||
    "—";

  const reviewPhoneNumber = (() => {
    const digits =
      clientDetails.phone.replace(
        /\D/g,
        ""
      );

    if (!digits) return "—";

    if (digits.length === 10) {
      return `+91 ${digits.slice(
        0,
        5
      )} ${digits.slice(5)}`;
    }

    return clientDetails.phone;
  })();


  const scrollProducts = (
    direction: "left" | "right"
  ) => {
    productScrollerRef.current?.scrollBy({
      left:
        direction === "left"
          ? -320
          : 320,
      behavior: "smooth",
    });
  };

  /* Track carousel scroll position so nav buttons can disable at the ends */
  useEffect(() => {
    const scroller = productScrollerRef.current;

    if (!scroller) return;

    const updateScrollState = () => {
      const { scrollLeft, scrollWidth, clientWidth } =
        scroller;

      setCanScrollLeft(scrollLeft > 4);

      setCanScrollRight(
        scrollLeft + clientWidth <
        scrollWidth - 4
      );
    };

    updateScrollState();

    scroller.addEventListener(
      "scroll",
      updateScrollState
    );

    window.addEventListener(
      "resize",
      updateScrollState
    );

    return () => {
      scroller.removeEventListener(
        "scroll",
        updateScrollState
      );

      window.removeEventListener(
        "resize",
        updateScrollState
      );
    };
  }, [vehicles, loadingVehicles]);

  const validateForm = () => {
    if (!user) {
      toast.error(
        "Please login to submit your campaign request."
      );

      openAuth("login");

      return false;
    }

    if (!clientDetails.name.trim()) {
      toast.error(
        "Enter client or company name."
      );

      return false;
    }

    if (
      clientDetails.phone.replace(
        /\D/g,
        ""
      ).length !== 10
    ) {
      toast.error(
        "Enter a valid 10-digit phone number."
      );

      return false;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        clientDetails.email.trim()
      )
    ) {
      toast.error(
        "Enter a valid email address."
      );

      return false;
    }

    if (!selectedVehicles.length) {
      toast.error(
        "Select at least one campaign vehicle."
      );

      productScrollerRef.current?.scrollIntoView(
        {
          behavior: "smooth",
          block: "center",
        }
      );

      return false;
    }

    for (const vehicle of selectedVehicles) {
      if (
        !vehicle.startDate ||
        !vehicle.endDate
      ) {
        toast.error(
          `Select campaign dates for ${vehicle.name}.`
        );

        return false;
      }

      if (
        isBefore(
          vehicle.endDate,
          vehicle.startDate
        )
      ) {
        toast.error(
          `The end date for ${vehicle.name} cannot be before the start date.`
        );

        return false;
      }

      if (
        !vehicle.quantity ||
        vehicle.quantity < 1
      ) {
        toast.error(
          `Enter a valid quantity for ${vehicle.name}.`
        );

        return false;
      }
    }

    return true;
  };

  const handleReviewSubmit = () => {
    if (submitting) return;

    if (!validateForm()) return;

    openReviewModal();
  };

  /* Step 1 of the campaign flow now ends here rather than at the review
     modal: Customer Details + Vehicle Selection → Campaign Details →
     Review Order. The selection is already persisted to the cart by the
     effect above, so the next page picks it up with nothing handed over.

     handleReviewSubmit and the review modal below are deliberately left in
     place — the same validation runs first, and the modal remains a working
     one-page fallback. */
  const handleContinueToCampaignDetails = () => {
    if (submitting) return;

    if (!validateForm()) return;

    router.push("/roadshow/campaign-details");
  };

  // const handleConfirmSend = async () => {
  //   if (submitting) return;

  //   try {
  //     setSubmitting(true);

  //     const payload = {
  //       clientId: user?._id || "",

  //       clientDetails: {
  //         name: clientDetails.name.trim(),

  //         phone:
  //           clientDetails.phone.replace(
  //             /\D/g,
  //             ""
  //           ),

  //         email:
  //           clientDetails.email
  //             .trim()
  //             .toLowerCase(),
  //       },

  //       vehicles: bookingRows.map(
  //         (vehicle) => ({
  //           vehicleId: vehicle.id,

  //           vehicleTypeId:
  //             vehicle.vehicleTypeId ||
  //             "",

  //           vehicleName: vehicle.name,

  //           packageId:
  //             vehicle.packageDetails
  //               ?._id || "",

  //           pricePerDay: toSafeNumber(
  //             vehicle.rate || 0
  //           ),

  //           startDate: formatDateForApi(
  //             vehicle.startDate
  //           ),

  //           endDate: formatDateForApi(
  //             vehicle.endDate
  //           ),

  //           days: vehicle.days,

  //           quantity:
  //             vehicle.quantity,

  //           total: vehicle.total,
  //         })
  //       ),

  //       grandTotal,
  //     };

  //     /*
  //      * Save the prepared request for the next
  //      * booking/checkout page.
  //      *
  //      * Replace this with your create campaign
  //      * request POST API after the endpoint is ready.
  //      */
  //     sessionStorage.setItem(
  //       "roadshow_campaign_payload",
  //       JSON.stringify(payload)
  //     );

  //     console.log(
  //       "Campaign request payload:",
  //       payload
  //     );

  //     toast.success(
  //       "Campaign request prepared successfully."
  //     );

  //     closeReviewModal();
  //   } catch (error) {
  //     console.error(
  //       "Campaign request error:",
  //       error
  //     );

  //     toast.error(
  //       "Unable to prepare campaign request."
  //     );
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };


  const handleConfirmSend = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);

      const storedDraft = sessionStorage.getItem(
        "roadshow_booking_draft"
      );

      let campaignMeta: {
        campaignType?: string;
        location?: string;
        route?: string;
        addOns?: string[];
      } = {};

      if (storedDraft) {
        try {
          const parsedDraft = JSON.parse(storedDraft);

          campaignMeta = {
            campaignType:
              typeof parsedDraft?.campaignType === "string"
                ? parsedDraft.campaignType.trim()
                : "",

            location:
              typeof parsedDraft?.location === "string"
                ? parsedDraft.location.trim()
                : "",

            route:
              typeof parsedDraft?.route === "string"
                ? parsedDraft.route.trim()
                : "",

            addOns: Array.isArray(parsedDraft?.addOns)
              ? parsedDraft.addOns.filter(
                (item: unknown) =>
                  typeof item === "string" && item.trim()
              )
              : [],
          };
        } catch {
          // Optional campaign metadata is unavailable.
        }
      }

      const payload = {
        name: clientDetails.name.trim(),

        email: clientDetails.email
          .trim()
          .toLowerCase(),

        phone: clientDetails.phone.replace(
          /\D/g,
          ""
        ),

        userId: user?._id,

        /* Agency orders arrive at admin already GST-verified — no re-entry */
        customerCategory: isAgency
          ? "organization"
          : "individual",

        ...(agencyBusiness
          ? {
            gstNumber: agencyBusiness.gst_number,
            gstDetailId: user?.gstDetailId,
            companyName:
              agencyBusiness.business_name,
            panNumber:
              agencyBusiness.business_pan || "",
            address:
              agencyBusiness.business_address ||
              "",
          }
          : {}),

        campaignType:
          campaignMeta.campaignType ||
          "Roadshow Campaign",

        location: campaignMeta.location || "",

        route: campaignMeta.route || "",

        addOns: campaignMeta.addOns || [],

        vehicleTypes: bookingRows.map(
          (vehicle) => ({
            vehicleId: vehicle.id,

            vehicleType:
              vehicle.vehicleTypeId ||
              vehicle.id,

            vehicleName: vehicle.name,

            quantity: vehicle.quantity,

            fromDate: formatDateForApi(
              vehicle.startDate
            ),

            toDate: formatDateForApi(
              vehicle.endDate
            ),

            pricePerDay: toSafeNumber(
              vehicle.rate
            ),

            lineTotal: toSafeNumber(
              vehicle.total
            ),
          })
        ),

        subtotal: grandTotal,

        gstPercentage: GST_PERCENT,

        gstAmount,

        estimatedTotal,
      };

      const response = await fetch(
        `${baseUrl}/client-requests`,
        {
          method: "POST",

          /* Customer-authenticated now — the backend takes the owner from
             this token rather than from the payload's userId. */
          headers: {
            "Content-Type": "application/json",
            ...clientAuthHeaders(),
          },

          body: JSON.stringify(payload),
        }
      );

      const result = await response
        .json()
        .catch(() => null);

      if (
        !response.ok ||
        !result?.success ||
        !result?.data?._id
      ) {
        throw new Error(
          result?.message ||
          "Unable to submit the campaign request."
        );
      }

      sessionStorage.setItem(
        "roadshow_last_client_request",
        JSON.stringify(result.data)
      );

      /* The request is placed — the saved cart is no longer needed */
      cartHydratedRef.current = false;
      unmatchedCartRef.current = [];
      hydratedSelectionRef.current = null;
      clearCart(user?._id);

      closeReviewModal();

      toast.success(
        "Booking request submitted successfully."
      );

      router.push(
        `/roadshow/booking-request-submitted/${result.data._id}`
      );
    } catch (error) {
      console.error(
        "Campaign request error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to submit the campaign request."
      );
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <main className="min-h-screen bg-white  pt-8 text-[#171719] sm:pt-10 lg:pt-14">
      <section className="mx-auto w-full  px-4 sm:px-6 lg:px-8 xl:px-12">
        <div
          className=" Rdsw_CrfMainSection  grid grid-cols-1 gap-8 lg:grid-cols-[minmax(320px,0.76fr)_minmax(0,1.28fr)] lg:items-start xl:gap-10"
        >
          {/* Campaign request form */}
          {/* Sticky position/top are set from JS (see the paired-column effect
              above) because the correct offset depends on this column's
              measured height. A static lg:sticky lg:top-24 would pin it while
              its own content is taller than the viewport and strand Add More
              Vehicle / Review & Submit below the fold. */}
          <aside
            ref={leftColumnRef}
            className="rounded-[26px] bg-[#f7f7f8] p-5 sm:p-6 rdsw_CrfLeftMain"
          >
            <div className="mb-7 rdsw_CrfLeftHeadingMain">
              <div className="text-[20px] font-semibold tracking-[-0.02em] text-[#1b1b1d] rdsw_CrfLeftHeading1">
                Campaign Request Form
              </div>
            </div>

            <div className="space-y-5">
              {/* Agency identity, already proven by GST at signup — read-only */}
              {agencyBusiness && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      GST Verified Agency
                    </span>

                    <span className="font-mono text-[11px] font-semibold tracking-wider text-[#575757]">
                      {agencyBusiness.gst_number}
                    </span>
                  </div>

                  <p className="text-[14px] font-bold leading-tight text-[#1b1b1d]">
                    {agencyBusiness.business_name}
                  </p>

                  {agencyBusiness.business_address && (
                    <p className="mt-1 text-[11.5px] leading-snug text-[#575757]">
                      {agencyBusiness.business_address}
                    </p>
                  )}

                  {agencyBusiness.business_pan && (
                    <p className="mt-1 text-[11.5px] text-[#575757]">
                      PAN{" "}
                      <span className="font-semibold text-[#1b1b1d]">
                        {agencyBusiness.business_pan}
                      </span>
                    </p>
                  )}
                </div>
              )}

              <label className="block">
                {/* <span className="mb-2 block text-[11px] font-medium text-[#575757]">
                  Full Name / Company Name *
                </span> */}

                <input
                  type="text"
                  value={clientDetails.name}
                  onChange={(event) =>
                    setClientDetails(
                      (current) => ({
                        ...current,
                        name:
                          event.target.value,
                      })
                    )
                  }
                  placeholder={
                    agencyBusiness
                      ? "Contact Person Name *"
                      : "Full Name / Company Name *"
                  }
                  className="rdw_crf_inputs h-10 w-full border-b border-[#aaaaaa] bg-transparent px-0 text-[13px] text-black outline-none transition placeholder:text-[#a0a0a0] focus:border-black"
                />
              </label>

              <label className="block">
                {/* <span className="mb-2 block text-[11px] font-medium text-[#575757]">
                  Phone Number *
                </span> */}

                <input
                  type="tel"
                  value={clientDetails.phone}
                  maxLength={10}
                  onChange={(event) =>
                    setClientDetails(
                      (current) => ({
                        ...current,
                        phone:
                          event.target.value
                            .replace(
                              /\D/g,
                              ""
                            )
                            .slice(0, 10),
                      })
                    )
                  }
                  placeholder="Phone Number *"
                  className="rdw_crf_inputs h-10 w-full border-b border-[#aaaaaa] bg-transparent px-0 text-[13px] text-black outline-none transition placeholder:text-[#a0a0a0] focus:border-black"
                />
              </label>

              <label className="block">
                {/* <span className="mb-2 block text-[11px] font-medium text-[#575757]">
                  Email Address *
                </span> */}

                <input
                  type="email"
                  value={clientDetails.email}
                  onChange={(event) =>
                    setClientDetails(
                      (current) => ({
                        ...current,
                        email:
                          event.target.value,
                      })
                    )
                  }
                  placeholder="Email Address *"
                  className="rdw_crf_inputs  h-10 w-full border-b border-[#aaaaaa] bg-transparent px-0 text-[13px] text-black outline-none transition placeholder:text-[#a0a0a0] focus:border-black"
                />
              </label>
            </div>

            <div className="rdsw_crfNoVehMain mt-7 space-y-4">
              {selectedVehicles.length ===
                0 && (
                  <div className="rounded-[18px] border border-dashed border-[#d4d4d4] bg-white px-5 py-8 text-center">
                    <p className=" rdsw_crfNoVehMainHeading font-semibold text-[#444444]">
                      No vehicle added
                    </p>

                    <p className=" rdsw_crfNoVehMainSubHeading mt-1  leading-5 text-[#8b8b8b]">
                      Choose a roadshow vehicle
                      from the product section.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        productScrollerRef.current?.scrollIntoView(
                          {
                            behavior:
                              "smooth",
                            block: "center",
                          }
                        )
                      }
                      className="rdsw_crfNoVehMainBtn mt-4 rounded-full bg-[#eeeeef] px-4 py-2 font-semibold text-[#222222]"
                    >
                      View Vehicles
                    </button>
                  </div>
                )}

              {selectedVehicles.map(
                (vehicle, index) => (
                  <div
                    key={vehicle.id}
                    className="rdsw_crfAddedVehMain rounded-[18px] bg-white p-4 shadow-[0_7px_25px_rgba(0,0,0,0.025)]"
                  >
                    <div className="mb-4 flex items-center justify-between rdsw_crfAddedVehContentMain">
                      <p className=" rdsw_crfAddedVehHeadingMain text-[11px] font-semibold uppercase tracking-[0.08em] text-[#858585]">
                        Vehicle {index + 1}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          removeVehicle(
                            vehicle.id
                          )
                        }
                        aria-label={`Remove ${vehicle.name}`}
                        className="rdsw_crfAddedVehHeadingMainRmvBtn flex h-7 w-7 items-center justify-center rounded-full bg-[#f3f3f3] text-[#a00000] transition hover:bg-[#d70000] hover:text-white"
                      >
                        <X size={13} />
                      </button>
                    </div>

                    <label className=" rdsw_crfVehLableMain block">
                      <span className=" rdsw_crfVehLableSpan mb-2 block text-[11px] font-medium text-[#777777]">
                        Vehicle Type *
                      </span>

                      <select
                        value={vehicle.id}
                        onChange={(event) =>
                          replaceSelectedVehicle(
                            vehicle.id,
                            event.target.value
                          )
                        }
                        className="rdsw_crdVehType h-10 w-full border-b border-[#bbbbbb] bg-transparent text-[12px] text-black outline-none focus:border-black"
                      >
                        {vehicles.map(
                          (vehicleOption) => (
                            <option
                              key={
                                vehicleOption.id
                              }
                              value={
                                vehicleOption.id
                              }
                            >
                              {
                                vehicleOption.name
                              }
                            </option>
                          )
                        )}
                      </select>
                    </label>

                    <div className=" rdsw_crfVehLableMain mt-5 grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveDateVehicleId(
                            vehicle.id
                          )
                        }
                        className="border-b border-[#bbbbbb] pb-2 text-left"
                      >
                        <span className="mb-1.5 block text-[10px] font-medium text-[#777777]">
                          Start Date
                        </span>

                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#222222]">
                          <CalendarDays
                            size={13}
                            className="shrink-0"
                          />

                          <span className="truncate">
                            {formatDate(
                              vehicle.startDate,
                              {
                                pattern:
                                  "dd MMM yyyy",
                                fallback:
                                  "Select date",
                              }
                            )}
                          </span>
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setActiveDateVehicleId(
                            vehicle.id
                          )
                        }
                        className="border-b border-[#bbbbbb] pb-2 text-left"
                      >
                        <span className="mb-1.5 block text-[10px] font-medium text-[#777777]">
                          End Date
                        </span>

                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#222222]">
                          <CalendarDays
                            size={13}
                            className="shrink-0"
                          />

                          <span className="truncate">
                            {formatDate(
                              vehicle.endDate,
                              {
                                pattern:
                                  "dd MMM yyyy",
                                fallback:
                                  "Select date",
                              }
                            )}
                          </span>
                        </span>
                      </button>
                    </div>

                    <div className=" mt-5 flex items-center justify-between gap-4">
                      <div>
                        <p className=" rdsw_crfQtyHeading text-[10px] font-medium text-[#777777]">
                          Vehicle Quantity
                        </p>

                        <p className=" rdsw_crfQtyDesc mt-1 text-[11px] text-[#aaaaaa]">
                          Select required vehicles
                        </p>

                        {/* Availability is advisory, not a gate. Requesting
                            more than the fleet currently shows as free is a
                            normal booking — admin resolves it when the order
                            is worked, so the stepper stays enabled and this
                            note explains the position instead of blocking it.

                            Rendered inside the existing label column so the
                            surrounding flex row keeps its two children and
                            its layout is untouched. */}
                        {(() => {
                          const shortfall =
                            vehicle.quantity >
                            toSafeNumber(
                              vehicle.availableVehicles
                            );

                          if (!shortfall) return null;

                          const nextAvailable =
                            getNextAvailableDate(vehicle);

                          return (
                            <p className="rdsw_crfQtyAvailabilityNote mt-1 text-[10.5px] leading-[1.45] text-[#8a6100]">
                              {toSafeNumber(
                                vehicle.availableVehicles
                              )}{" "}
                              available now
                              {nextAvailable
                                ? ` · more available from ${formatDate(
                                  nextAvailable,
                                  {
                                    pattern:
                                      "dd MMM yyyy",
                                    fallback: "",
                                  }
                                )}`
                                : ""}
                              . You can still request this
                              quantity — our team will confirm
                              it.
                            </p>
                          );
                        })()}
                      </div>

                      <div className="rdsw_crfQtyBtnMain flex shrink-0 items-center gap-2 rounded-full bg-[#f3f3f4] p-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateSelectedVehicle(
                              vehicle.id,
                              {
                                quantity:
                                  Math.max(
                                    vehicle.quantity -
                                    1,
                                    1
                                  ),
                              }
                            )
                          }
                          disabled={vehicle.quantity <= 1}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black shadow-sm transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-black"
                          aria-label="Reduce quantity"
                        >
                          <Minus size={12} />
                        </button>

                        <span className="min-w-5 text-center text-[12px] font-semibold">
                          {vehicle.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateSelectedVehicle(
                              vehicle.id,
                              {
                                quantity:
                                  vehicle.quantity +
                                  1,
                              }
                            )
                          }
                          /* Previously disabled once quantity reached
                             availableVehicles, which hard-blocked any
                             partially-booked type. Availability is now
                             surfaced as the note above instead: the
                             customer requests what they need and admin
                             resolves the shortfall on the order. */
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black shadow-sm transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-black"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {/* <button
                type="button"
                onClick={handleReviewSubmit}
                disabled={submitting}
                className="rdsw_crfVehSubmitBtn flex  items-center justify-center gap-2 rounded-full bg-[#1a1a1c] px-6 py-3 text-[12px] font-semibold text-white transition hover:bg-[#d70000] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}

                {submitting
                  ? "Submitting..."
                  : "Submit"}
              </button> */}
              <VehicleCrfSubmitBtn
                type="button"
                label="Continue"
                loadingLabel="Opening Campaign Details..."
                loading={submitting}
                disabled={submitting}
                ariaLabel="Continue to campaign details"
                onClick={handleContinueToCampaignDetails}
                className="RS_VehicleButton rdsw_crfVehSubmitBtn flex items-center justify-center gap-2 rounded-full bg-[#1a1a1c] px-6 py-3 text-[12px] font-semibold  transition disabled:cursor-not-allowed disabled:opacity-60"
              />

              <VehicleCrfAddMoreVehBtn
                type="button"
                label="Add More Vehicle"
                ariaLabel="Add more vehicle"
                onClick={() =>
                  productScrollerRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  })
                }
                className="RS_VehicleButton rdsw_crfVehAddVehBtn rounded-full bg-[#dedee1] px-6 py-3 text-[12px] font-semibold text-[#202020] transition"
              />

              {/* <button
                type="button"
                onClick={() =>
                  productScrollerRef.current?.scrollIntoView(
                    {
                      behavior: "smooth",
                      block: "center",
                    }
                  )
                }
                className="rdsw_crfVehAddVehBtn rounded-full bg-[#dedee1] px-6 py-3 text-[12px] font-semibold text-[#202020] transition hover:bg-[#cfcfd2]"
              >
                Add More Vehicle
              </button> */}

            </div>
          </aside>
          {/* Product details */}
          <section
            ref={rightColumnRef}
            className="rdsw_crfProdDetailsMain min-w-0 rdsw_crfProdDetailsScrollPane"
          >
            {/* Section heading */}
            <div className="rdsw_crfProdDetailsHeadingWrapper">
              <p className="rdsw_crfProdDetails1stHeading">
                Roadshow booking
              </p>

              <h2 className="rdsw_crfProdDetails2ndHeading">
                Product Details
              </h2>

              <p className="rdsw_crfProdDetailsDesc">
                Choose your roadshow vehicles and campaign dates. You can add campaign details in the next step.
              </p>
            </div>

            {/* Vehicle cards */}
            <div className="rdsw_crfProdDetailsVehicleSection">
              <div
                ref={productScrollerRef}
                className="rdsw_crfProdDetailsScroller"
              >
                {/* Loading skeleton */}
                {loadingVehicles &&
                  Array.from({ length: 4 }).map((_, index) => (
                    <article
                      key={index}
                      className="rdsw_crfProdDetailsSkeletonCard"
                    >
                      <div className="rdsw_crfProdDetailsSkeletonImage" />

                      <div className="rdsw_crfProdDetailsSkeletonTitle" />

                      <div className="rdsw_crfProdDetailsSkeletonPrice" />

                      <div className="rdsw_crfProdDetailsSkeletonRating" />

                      <div className="rdsw_crfProdDetailsSkeletonButton" />
                    </article>
                  ))}

                {/* Empty state */}
                {!loadingVehicles && vehicles.length === 0 && (
                  <div className="rdsw_crfProdDetailsEmptyState">
                    <p className="rdsw_crfProdDetailsEmptyTitle">
                      No vehicles available
                    </p>

                    <p className="rdsw_crfProdDetailsEmptyDesc">
                      Campaign vehicles could not be found.
                    </p>
                  </div>
                )}

                {/* Vehicle cards */}
                {!loadingVehicles &&
                  sortedVehicles.map((vehicle) => {
                    const selected = isSelected(vehicle.id);

                    return (
                      <article
                        key={vehicle.id}
                        ref={(node) => {
                          if (node) {
                            cardNodesRef.current.set(
                              vehicle.id,
                              node
                            );
                          } else {
                            cardNodesRef.current.delete(
                              vehicle.id
                            );
                          }
                        }}
                        className={[
                          "rdsw_crfProdDetailsCardMain",
                          selected
                            ? "rdsw_crfProdDetailsCardSelected"
                            : "",
                        ].join(" ")}
                      >
                        <div className="rdsw_crfProdDetailsImageWrapper">
                          {selected && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                removeVehicle(vehicle.id);
                              }}
                              className="rdsw_crfProdDetailsRemoveVehicleBtn"
                              aria-label={`Remove ${vehicle.name} from campaign`}
                              title="Remove vehicle"
                            >
                              <Trash2
                                size={17}
                                strokeWidth={1.9}
                              />
                            </button>
                          )}

                          <img
                            src={
                              vehicle.image ||
                              FALLBACK_VEHICLE_IMAGE
                            }
                            alt={vehicle.name}
                            className="rdsw_crfProdDetailsVehicleImage"
                            onError={(event) => {
                              const image = event.currentTarget;

                              if (
                                image.src !==
                                FALLBACK_VEHICLE_IMAGE
                              ) {
                                image.src =
                                  FALLBACK_VEHICLE_IMAGE;
                              }
                            }}
                          />
                        </div>

                        <div className="rdsw_crfProdDetailsCardContent">
                          <h3 className="rdsw_crfProdDetailsVehicleName">
                            {vehicle.name}
                          </h3>

                          <p className="rdsw_crfProdDetailsVehiclePrice">
                            {formatCurrency(vehicle.rate)}
                            <span>/ Per Day</span>
                          </p>

                          {vehicle.rating !== undefined &&
                            vehicle.rating !== null && (
                              <div className="rdsw_crfProdDetailsRating">
                                <span className="rdsw_crfProdDetailsRatingValue">
                                  {vehicle.rating}
                                </span>

                                {/* <span className="rdsw_crfProdDetailsRatingStar"> */}
                                <div><img src='/images/assets/RS_VehicleRateStar.svg' className='rdsw_crfVehRatingStar' alt="Rating" /></div>
                                {/* </span> */}
                              </div>
                            )}

                          <button
                            type="button"
                            onClick={() =>
                              toggleVehicle(vehicle)
                            }
                            aria-label={
                              selected
                                ? `Remove ${vehicle.name}`
                                : `Add ${vehicle.name}`
                            }
                            className={[
                              "rdsw_crfProdDetailsVehicleButton",
                              selected
                                ? "rdsw_crfProdDetailsVehicleButtonSelected"
                                : "",
                            ].join(" ")}
                          >
                            {selected && (
                              <Image
                                src="/images/assets/rdsw_crfProdDetailsCheckMark.svg"
                                alt=""
                                width={18}
                                height={18}
                                className="rdsw_crfProdDetailsCheckMark"
                              />
                            )}

                            <span>
                              {selected
                                ? "Vehicle Added"
                                : "Add Vehicle"}
                            </span>
                          </button>
                        </div>
                      </article>
                    );
                  })}
              </div>

              {/* Carousel navigation */}
              <div className="rdsw_crfProdDetailsNavigation">
                <button
                  type="button"
                  onClick={() => scrollProducts("left")}
                  className="rdsw_crfProdDetailsNavigationButton"
                  aria-label="Previous vehicles"
                  disabled={!canScrollLeft}
                >
                  <ChevronLeft size={26} />
                </button>

                <button
                  type="button"
                  onClick={() => scrollProducts("right")}
                  className="rdsw_crfProdDetailsNavigationButton"
                  aria-label="Next vehicles"
                  disabled={!canScrollRight}
                >
                  <ChevronRight size={26} />
                </button>
              </div>
            </div>

            {/* Desktop summary table */}
            <div className="rdsw_crfProdDetailsDesktopTable">
              <div className="rdsw_crfProdDetailsTableHeader">
                <span>Name</span>
                <span>Price</span>
                <span>Days</span>
                <span>Qty</span>
                <span>Total</span>
              </div>

              <div className="rdsw_crfProdDetailsTableBody">
                {bookingRows.length === 0 && (
                  <div className="rdsw_crfProdDetailsTableEmpty">
                    Select a vehicle to view the booking summary.
                  </div>
                )}

                {bookingRows.map((vehicle, index) => (
                  <div
                    key={vehicle.id}
                    className="rdsw_crfProdDetailsTableRow"
                    style={{
                      animationDelay: `${index * 60}ms`,
                    }}
                  >
                    <span className="rdsw_crfProdDetailsTableVehicleName">
                      {vehicle.name}
                    </span>

                    <span>
                      {formatCurrency(vehicle.rate)}
                    </span>

                    <span>
                      {vehicle.days} day(s)
                    </span>

                    <span>
                      {vehicle.quantity} vehicle(s)
                    </span>

                    <span>
                      {formatCurrency(vehicle.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile summary */}
            <div className="rdsw_crfProdDetailsMobileSummary">
              <div className="rdsw_crfProdDetailsMobileSummaryHeader">
                <h3>Booking summary</h3>

                <span>
                  {bookingRows.length} vehicle
                  {bookingRows.length === 1 ? "" : "s"}
                </span>
              </div>

              {bookingRows.length === 0 && (
                <div className="rdsw_crfProdDetailsMobileEmpty">
                  Select a vehicle to view the booking summary.
                </div>
              )}

              {bookingRows.map((vehicle) => (
                <article
                  key={vehicle.id}
                  className="rdsw_crfProdDetailsMobileCard"
                >
                  <div className="rdsw_crfProdDetailsMobileCardTop">
                    <div>
                      <h4>{vehicle.name}</h4>

                      <p>
                        {vehicle.days} day(s) ·{" "}
                        {vehicle.quantity} vehicle(s)
                      </p>
                    </div>

                    <strong>
                      {formatCurrency(vehicle.total)}
                    </strong>
                  </div>

                  <div className="rdsw_crfProdDetailsMobilePrice">
                    <span>Price per day</span>

                    <strong>
                      {formatCurrency(vehicle.rate)}
                    </strong>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>

      {activeDateVehicle && (
        <DatePicker
          checkIn={
            activeDateVehicle.startDate
          }
          checkOut={
            activeDateVehicle.endDate
          }
          setCheckIn={(date) =>
            updateSelectedVehicle(
              activeDateVehicle.id,
              {
                startDate: date,
              }
            )
          }
          setCheckOut={(date) =>
            updateSelectedVehicle(
              activeDateVehicle.id,
              {
                endDate: date,
              }
            )
          }
          open
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setActiveDateVehicleId(null);
            }
          }}
          showInputCard={false}
          popupMode="dialog"
          title="Select campaign dates"
        />
      )}

      {/* Sticky cart summary — appears only once a vehicle is added and
          hides while the review modal is open so it cannot overlap it. */}
      <AnimatePresence>
        {selectedVehicles.length > 0 &&
          !isReviewOpen && (
            <motion.div
              className="rdsw_crfStickyBar"
              initial={{ y: 90, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 90, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 32,
              }}
            >
              <div className="rdsw_crfStickyBarInner">
                <div className="rdsw_crfStickyBarInfo">
                  <span className="rdsw_crfStickyBarCount">
                    {selectedVehicles.length}
                  </span>

                  <span className="rdsw_crfStickyBarLabel">
                    {selectedVehicles.length === 1
                      ? "Vehicle added"
                      : "Vehicles added"}
                  </span>
                </div>

                <div className="rdsw_crfStickyBarTotal">
                  <span className="rdsw_crfStickyBarTotalLabel">
                    Estimated Total
                  </span>

                  <span className="rdsw_crfStickyBarTotalValue">
                    {formatCurrency(
                      estimatedTotal
                    )}
                  </span>

                  <span className="rdsw_crfStickyBarTotalNote">
                    incl. {GST_PERCENT}% GST
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleContinueToCampaignDetails}
                  disabled={submitting}
                  className="rdsw_crfStickyBarButton"
                >
                  {submitting
                    ? "Opening..."
                    : "Continue to Campaign Details"}
                </button>
              </div>
            </motion.div>
          )}
      </AnimatePresence>

      {isReviewOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-99999 flex overflow-y-auto">
            <div
              className="fixed inset-0 h-full w-full bg-black/35 backdrop-blur-[1px]"
              onClick={closeReviewModal}
            />

            <div
              className="rdsw_reviewModalShell relative w-full m-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeReviewModal}
                aria-label="Close"
                className="rdsw_reviewModalCloseBtn absolute right-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full sm:right-6 sm:top-6 sm:h-11 sm:w-11"
              >
                <X size={20} strokeWidth={2.25} />
              </button>

              <div className="rdsw_reviewModalLayout">
                {/* Left side: independently scrollable when many vehicles are selected */}
                <section className="rdsw_reviewLeftPanel">
                  <h2 className="rdsw_reviewTitle">
                    Review Your Order &amp; Confirm
                  </h2>

                  <section className="rdsw_reviewSection">
                    <div className="rdsw_reviewSectionHeading">
                      <span
                        className="rdsw_reviewHeadingDot"
                        aria-hidden="true"
                      >
                        <i className="fa-regular fa-circle-user"></i>
                      </span>
                      <h3>Contact Details</h3>
                    </div>

                    <div className="rdsw_reviewContactDetails">
                      <div className="rdsw_reviewContactRow">
                        <span className="rdsw_reviewContactLabel">
                          Name
                        </span>

                        <span className="rdsw_reviewContactValue">
                          - {clientDetails.name || "—"}
                        </span>
                      </div>

                      {/* <div className="rdsw_reviewContactRow">
                  <span className="rdsw_reviewContactLabel">
                    Company Name
                  </span>

                  <span className="rdsw_reviewContactValue">
                    - {reviewCompanyName}
                  </span>
                </div> */}

                      <div className="rdsw_reviewContactRow">
                        <span className="rdsw_reviewContactLabel">
                          Phone Number
                        </span>

                        <span className="rdsw_reviewContactValue">
                          - {reviewPhoneNumber}
                        </span>
                      </div>

                      <div className="rdsw_reviewContactRow">
                        <span className="rdsw_reviewContactLabel">
                          Email Address
                        </span>

                        <span className="rdsw_reviewContactValue">
                          - {clientDetails.email || "—"}
                        </span>
                      </div>
                    </div>
                  </section>

                  <section className="rdsw_reviewSection rdsw_reviewVehicleSection">
                    <div className="rdsw_reviewSectionHeading">
                      <span
                        className="rdsw_reviewHeadingDot"
                        aria-hidden="true"
                      >
                        <i className="fa-regular fa-circle-check"></i>
                      </span>
                      <h3>Selected Vehicles</h3>
                    </div>

                    <div className="rdsw_reviewVehicleList">
                      {bookingRows.map(
                        (vehicle, index) => (
                          <article
                            key={vehicle.id}
                            className="rdsw_reviewVehicleCard"
                            style={{
                              animationDelay: `${index * 70
                                }ms`,
                            }}
                          >
                            <div className="rdsw_reviewVehicleInfoColumn">
                              <div>
                                <p className="rdsw_reviewVehicleLabel">
                                  Vehicle Type {index + 1}
                                </p>

                                <p className="rdsw_reviewVehicleName">
                                  {vehicle.name}
                                </p>
                              </div>

                              <div>
                                <p className="rdsw_reviewVehicleLabel">
                                  Vehicle Quantity
                                </p>

                                <p className="rdsw_reviewVehicleValue">
                                  {vehicle.quantity}
                                </p>
                              </div>
                            </div>

                            <div className="rdsw_reviewVehicleInfoColumn">
                              <div>
                                <p className="rdsw_reviewVehicleLabel">
                                  Start Date
                                </p>

                                <p className="rdsw_reviewVehicleValue">
                                  {formatDate(
                                    vehicle.startDate,
                                    {
                                      pattern:
                                        "dd MMM yyyy",
                                      fallback: "—",
                                    }
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="rdsw_reviewVehicleLabel">
                                  Rate Per Day
                                </p>

                                <p className="rdsw_reviewVehicleValue">
                                  {formatCurrency(
                                    vehicle.rate
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="rdsw_reviewVehicleInfoColumn">
                              <div>
                                <p className="rdsw_reviewVehicleLabel">
                                  End Date
                                </p>

                                <p className="rdsw_reviewVehicleValue">
                                  {formatDate(
                                    vehicle.endDate,
                                    {
                                      pattern:
                                        "dd MMM yyyy",
                                      fallback: "—",
                                    }
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="rdsw_reviewVehicleLabel">
                                  Duration
                                </p>

                                <p className="rdsw_reviewVehicleValue">
                                  {vehicle.days}{" "}
                                  {vehicle.days === 1
                                    ? "Day"
                                    : "Days"}
                                </p>
                              </div>
                            </div>

                            <div className="rdsw_reviewVehicleTotal">
                              <p className="rdsw_reviewVehicleTotalLabel">
                                Vehicle Total
                              </p>

                              <p className="rdsw_reviewVehicleTotalValue">
                                {formatCurrency(
                                  vehicle.total
                                )}
                              </p>
                            </div>
                          </article>
                        )
                      )}
                    </div>
                  </section>
                </section>

                {/* Right side: sticky pricing summary and actions */}
                <aside className="rdsw_reviewRightColumn">
                  <div className="rdsw_reviewPricingCard">
                    <h3 className="rdsw_reviewPricingTitle">
                      Pricing Summary
                    </h3>

                    <div className="rdsw_reviewPricingRows">
                      <div className="rdsw_reviewPricingRow">
                        <span>Subtotal</span>

                        <span>
                          {formatCurrency(
                            grandTotal
                          )}
                        </span>
                      </div>

                      <div className="rdsw_reviewPricingRow">
                        <span>GST {GST_PERCENT}%</span>

                        <span>
                          {formatCurrency(
                            gstAmount
                          )}
                        </span>
                      </div>

                      <div className="rdsw_reviewPricingRow rdsw_reviewPricingTotalRow">
                        <span>Estimated Total</span>

                        <strong>
                          {formatCurrency(
                            estimatedTotal
                          )}
                        </strong>
                      </div>
                      <p className="rdsw_reviewPricingNote">
                        Note: This is an estimated cost. The final quotation may vary based on campaign requirements, branding, fabrication, logistics, and other applicable charges.
                      </p>
                    </div>


                  </div>

                  {/* <p className="rdsw_reviewPricingNote">
                    Note: This is an estimated cost. The final quotation may vary based on campaign requirements, branding, fabrication, logistics, and other applicable charges.
                  </p> */}

                  <div className="rdsw_reviewActions">
                    <button
                      type="button"
                      onClick={closeReviewModal}
                      className="rdsw_reviewActionButton rdsw_reviewEditButton"
                    >

                      <Image
                        src="/images/assets/CRF_RequestEditBtn.svg"
                        alt=""
                        width={18}
                        height={18}
                        className="rdsw_crfProdDetailsCheckMark rdsw_reviewEditReqIcon"
                      />

                      <span>Edit Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirmSend}
                      disabled={submitting}
                      className="rdsw_reviewActionButton rdsw_reviewSendButton"
                    >
                      {submitting ? (
                        <span
                          className="rdsw_reviewSendSpinner"
                          aria-hidden="true"
                        />
                      ) : (

                        <Image
                          src="/images/assets/CRF_RequestSendBtn.svg"
                          alt=""
                          width={18}
                          height={18}
                          className="rdsw_crfProdDetailsCheckMark rdsw_reviewEditReqIcon"
                        />
                      )}
                      <span>
                        {submitting
                          ? "Sending..."
                          : "Send Request"}
                      </span>
                    </button>
                  </div>
                </aside>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </main>
  );
}
