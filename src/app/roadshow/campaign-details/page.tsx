/* eslint-disable */
// @ts-nocheck
"use client";

/* -------------------------------------------------------------------------- */
/*                        CAMPAIGN DETAILS  (step 2 of 3)                     */
/* -------------------------------------------------------------------------- */
/*  Customer Details + Vehicle Selection  →  CAMPAIGN DETAILS  →  Review Order */
/*                                                                            */
/*  What used to be a popup is a page of its own: one card per selected        */
/*  vehicle, each carrying its own campaign type/name/location, promoter       */
/*  requirement and media. Vehicles, dates and quantities are read from — and  */
/*  written back to — the SAME cart the CampaignRequest page owns              */
/*  (roadshowCart.ts), so the existing date logic is reused rather than        */
/*  reimplemented and every vehicle keeps its own campaign dates.              */
/*                                                                            */
/*  Campaign copy lives in roadshowCampaignDraft.ts, keyed by vehicleId, so    */
/*  navigating back and forth between the three pages never loses typing.      */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Pencil,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";

import DatePicker from "@/components/calendar/calendar_reusable/calender";
import { useAuth } from "@/context/AuthContext";
import {
  FALLBACK_VEHICLE_IMAGE,
  fetchAllRoadshowVehicles,
  type RoadshowVehicle,
} from "@/lib/roadshowVehicles";
import {
  clearCart,
  readCart,
  writeCart,
  type CartItem,
} from "@/lib/roadshowCart";
import {
  applyDetailsToAll,
  clearCampaignDraft,
  copyMediaToAll,
  emptyCampaignDetails,
  ensureMediaOwner,
  getMedia,
  hasPendingMedia,
  readCampaignDraft,
  reconcileDraftWithVehicles,
  restoreDetailsFromSnapshot,
  setMedia,
  toMediaMeta,
  writeCampaignDraft,
} from "@/lib/roadshowCampaignDraft";
import { submitClientRequest } from "@/lib/roadshowRequestSubmit";
import {
  formatMoney,
  priceOrder,
  priceVehicleLine,
} from "@/lib/roadshowPricing";
import {
  formatDateForApi,
  parseStoredDate,
  toSafeNumber,
} from "@/app/utils/currency";
import { languages as LANGUAGE_OPTIONS } from "@/app/utils/collection.json";
import { baseUrl, GST_Percentage } from "@/BaseUrl";

import VehicleCampaignCard from "./VehicleCampaignCard";
import ReviewOrderModal from "./ReviewOrderModal";
import "./page.css";

/**
 * Field errors for one vehicle, or an empty object when it is complete.
 *
 * Pure and module-level on purpose: the rail's completion ticks, the
 * "Next Vehicle" guard and the final Review check all call this, so there is
 * exactly one definition of "this vehicle is done" and they cannot drift.
 */
const getVehicleErrors = (vehicle, details) => {
  const vehicleErrors = {};

  if (!vehicle.startDate || !vehicle.endDate) {
    vehicleErrors.dates = "Select campaign dates for this vehicle.";
  } else if (vehicle.endDate < vehicle.startDate) {
    vehicleErrors.dates = "The end date cannot be before the start date.";
  }

  if (!details.campaignType.trim()) {
    vehicleErrors.campaignType = "Select a campaign type.";
  }

  if (
    details.campaignType === "Others" &&
    !details.otherCampaignType.trim()
  ) {
    vehicleErrors.otherCampaignType = "Specify the campaign type.";
  }

  if (!details.campaignName.trim()) {
    vehicleErrors.campaignName = "Enter a campaign name.";
  }

  if (!details.campaignLocation.trim()) {
    vehicleErrors.campaignLocation = "Enter a campaign location.";
  }

  if (details.needPromoter) {
    if (!details.promoterType.trim()) {
      vehicleErrors.promoterType = "Select a promoter type.";
    }

    if (
      details.promoterType === "Other" &&
      !details.otherPromoterType.trim()
    ) {
      vehicleErrors.otherPromoterType = "Specify the promoter type.";
    }

    if (!details.promoterGender.trim()) {
      vehicleErrors.promoterGender = "Select a gender.";
    }

    if (!details.promoterLanguage.length) {
      vehicleErrors.promoterLanguage = "Select at least one language.";
    }

    if (details.promoterQuantity < 1) {
      vehicleErrors.promoterQuantity =
        "Enter the number of promoters needed.";
    }
  }

  return vehicleErrors;
};

export default function CampaignDetailsPage() {
  const router = useRouter();
  const { user, openAuth, authLoading, isAgency } = useAuth();

  const agencyBusiness = isAgency ? user?.business || null : null;

  const [vehicles, setVehicles] = useState<RoadshowVehicle[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [draft, setDraft] = useState(() => ({
    vehicles: {},
    appliedToAllFrom: null,
    appliedSnapshot: null,
    appliedDates: null,
  }));
  const [mediaByVehicle, setMediaByVehicle] = useState({});
  const [campaignTypes, setCampaignTypes] = useState<string[]>([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeDateVehicleId, setActiveDateVehicleId] = useState<
    string | null
  >(null);

  /* Review is a popup over this page — the customer confirms and sends
     without losing their place, and only a successful send navigates on. */
  const [reviewOpen, setReviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* Which vehicle's campaign form is on screen */
  const [activeIndex, setActiveIndex] = useState(0);
  const stepperRef = useRef<HTMLDivElement>(null);

  const authPromptedRef = useRef(false);

  /* WHICH customer this page has been hydrated for, not merely whether it
     has been. A plain boolean never re-ran when the signed-in customer
     changed, so signing out and back in as someone else left the previous
     customer's vehicles on screen — and the persist effect below then wrote
     them into the NEW customer's storage key. Keyed on the user id, the
     effect re-runs on every switch and swaps in that person's own cart. */
  const hydratedUserKeyRef = useRef<string | null>(null);

  /* The exact draft object hydration produced. The persist effect refuses to
     write until React has committed it, otherwise the outgoing customer's
     draft would be saved under the incoming customer's key. */
  const hydratedDraftRef = useRef<unknown>(null);

  /* Latest draft, readable from callbacks that must not depend on it (and
     must not read state inside a reducer). Kept in sync below. */
  const draftRef = useRef(draft);
  draftRef.current = draft;

  /* Each vehicle's own files as they were just before "apply to all" was
     ticked, so unticking hands them back along with the typed details.

     Deliberately a ref and not part of the persisted draft: File objects
     cannot be serialised, which is the same reason the media store itself
     is tab-lifetime only. Refreshing the page while the box is ticked
     therefore restores the typed details but leaves the copied files in
     place — the campaign copy is what customers actually retype. */
  const mediaSnapshotRef = useRef<Record<string, unknown> | null>(null);

  /* ── Auth gate ─────────────────────────────────────────────────────────
     Same contract as CampaignRequest: prompt once, never loop. */
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      if (!authPromptedRef.current) {
        authPromptedRef.current = true;

        toast.error("Please login to continue booking.", {
          id: "campaign-details-login-required",
        });

        openAuth("login");
      }

      return;
    }

    authPromptedRef.current = false;
  }, [user, authLoading, openAuth]);

  /* ── Catalogue ─────────────────────────────────────────────────────── */
  useEffect(() => {
    let componentMounted = true;

    const loadVehicles = async () => {
      try {
        const apiVehicles = await fetchAllRoadshowVehicles();

        if (!componentMounted) return;

        setVehicles(apiVehicles || []);
      } catch (error) {
        console.error("Campaign vehicle loading error:", error);

        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load campaign vehicles."
        );
      } finally {
        if (componentMounted) setLoading(false);
      }
    };

    loadVehicles();

    return () => {
      componentMounted = false;
    };
  }, []);

  /* ── Campaign types ────────────────────────────────────────────────────
     Same endpoint the admin vehicle modal reads, so the two surfaces offer
     the same list. A failure is non-fatal: "Others" is always available. */
  useEffect(() => {
    let componentMounted = true;

    fetch(`${baseUrl}/admin/campaign-types`)
      .then((response) => response.json())
      .then((result) => {
        if (!componentMounted) return;

        const types = result?.data?.types;

        if (Array.isArray(types)) {
          setCampaignTypes(
            types
              .map((type) => String(type?.name || "").trim())
              .filter(Boolean)
          );
        }
      })
      .catch(() => {
        /* Optional list — the customer can still pick "Others". */
      });

    return () => {
      componentMounted = false;
    };
  }, []);

  /* ── Rebuild the selection from the saved cart ─────────────────────────
     Re-runs whenever the signed-in customer changes, so logging out and in
     as someone else loads THAT person's cart and campaign copy instead of
     leaving the previous one on screen. */
  useEffect(() => {
    if (authLoading) return;
    if (!vehicles.length) return;

    const userKey = String(user?._id || "guest");

    if (hydratedUserKeyRef.current === userKey) return;

    const savedCart = readCart(user?._id);

    const restored = savedCart
      .map((item) => {
        const matched = vehicles.find(
          (vehicle) => String(vehicle.id) === String(item.vehicleId)
        );

        if (!matched) return null;

        const directRate = toSafeNumber(matched.rate);
        const packageRate = toSafeNumber(
          matched.packageDetails?.perDayRentalCost
        );

        return {
          ...matched,
          rate: directRate > 0 ? directRate : packageRate,
          startDate: parseStoredDate(item.startDate),
          endDate: parseStoredDate(item.endDate),
          quantity: Math.max(Number(item.quantity || 1), 1),
        };
      })
      .filter(Boolean);

    if (!restored.length) {
      /* Claim the key before leaving, or the effect re-fires on the way out
         and toasts the same message again. */
      hydratedUserKeyRef.current = userKey;

      toast.error("Select at least one campaign vehicle first.");
      router.replace("/roadshow/CampaignRequest");
      return;
    }

    const vehicleIds = restored.map((vehicle) => String(vehicle.id));

    const reconciled = reconcileDraftWithVehicles(
      readCampaignDraft(user?._id),
      vehicleIds
    );

    /* Files are held per vehicle, not per customer — hand the store over
       before reading it so a new customer cannot inherit the last one's
       uploads for a vehicle they both selected. */
    ensureMediaOwner(user?._id);

    /* Mirror the in-memory media store into state so removals re-render */
    const media = {};

    vehicleIds.forEach((vehicleId) => {
      media[vehicleId] = getMedia(vehicleId);
    });

    hydratedUserKeyRef.current = userKey;
    hydratedDraftRef.current = reconciled;

    /* Belongs to the customer who just left — never offer it to this one */
    mediaSnapshotRef.current = null;

    setSelectedVehicles(restored);
    setDraft(reconciled);
    setMediaByVehicle(media);

    /* A customer switch must not leave the stepper parked on the previous
       customer's vehicle 3, or their validation errors on screen. */
    setActiveIndex(0);
    setErrors({});
  }, [vehicles, user, authLoading, router]);

  /* Persist campaign copy on every edit — held back until THIS customer's
     draft has been restored, so neither the initial empty draft nor the
     previous customer's still-rendered one can overwrite saved typing. */
  useEffect(() => {
    const userKey = String(user?._id || "guest");

    if (hydratedUserKeyRef.current !== userKey) return;

    /* Both effects react to `user`, and this one runs in the same commit as
       hydration, before React has applied the restored draft. Wait for that
       exact object to arrive before writing anything. */
    if (hydratedDraftRef.current) {
      if (draft !== hydratedDraftRef.current) return;

      hydratedDraftRef.current = null;
    }

    writeCampaignDraft(user?._id, draft);
  }, [draft, user]);

  /* Dates and quantities belong to the cart, not the draft — write them
     back so returning to CampaignRequest shows the same selection. */
  const persistCart = useCallback(
    (rows) => {
      writeCart(
        user?._id,
        rows.map((vehicle) => ({
          vehicleId: String(vehicle.id),
          startDate: vehicle.startDate
            ? formatDateForApi(vehicle.startDate)
            : null,
          endDate: vehicle.endDate
            ? formatDateForApi(vehicle.endDate)
            : null,
          quantity: vehicle.quantity,
        })) as CartItem[]
      );
    },
    [user]
  );

  const updateSelectedVehicle = useCallback(
    (vehicleId, updates) => {
      setSelectedVehicles((current) => {
        const next = current.map((vehicle) =>
          String(vehicle.id) === String(vehicleId)
            ? { ...vehicle, ...updates }
            : vehicle
        );

        persistCart(next);

        return next;
      });
    },
    [persistCart]
  );

  const updateDetails = useCallback((vehicleId, patch) => {
    const id = String(vehicleId);

    setDraft((current) => {
      const base = current.vehicles[id] || emptyCampaignDetails(id);
      const updated = { ...base, ...patch };

      /* While "apply to all" is CHECKED the vehicles genuinely share one set
         of campaign details, so every later edit to the source propagates
         too. Without this the box would apply a snapshot once and then let
         the others quietly go stale as the customer kept typing. */
      if (current.appliedToAllFrom === id) {
        const vehicles = {};

        Object.keys(current.vehicles).forEach((otherId) => {
          vehicles[otherId] =
            otherId === id
              ? updated
              : {
                  ...updated,
                  vehicleId: otherId,
                  promoterLanguage: [...updated.promoterLanguage],
                  campaignImages: [...updated.campaignImages],
                  campaignVideos: [...updated.campaignVideos],
                };
        });

        return { ...current, vehicles };
      }

      /* Editing any other card means they are no longer all the same.
         The snapshot goes with the link: choosing to change one card is a
         deliberate divergence, so the others keep the values they are
         showing rather than silently springing back — which is exactly
         what the card's own note promises. */
      mediaSnapshotRef.current = null;

      return {
        ...current,
        vehicles: { ...current.vehicles, [id]: updated },
        appliedToAllFrom: null,
        appliedSnapshot: null,
        appliedDates: null,
      };
    });

    /* Clear this card's errors as soon as it is touched */
    setErrors((current) => {
      if (!current[id]) return current;

      const next = { ...current };
      delete next[id];

      return next;
    });
  }, []);

  const updateMedia = useCallback(
    (vehicleId, bucket) => {
      const id = String(vehicleId);

      /* Same rule as updateDetails: while the box is checked, media picked
         on the source vehicle belongs to all of them. Read from the ref
         rather than inside the state updater — writing the media store from
         a reducer would run twice under StrictMode. */
      const shareAll = draftRef.current.appliedToAllFrom === id;

      const targetIds = shareAll
        ? Object.keys(draftRef.current.vehicles)
        : [id];

      const images = toMediaMeta(bucket.images);
      const videos = toMediaMeta(bucket.videos);

      const nextMedia = {};

      targetIds.forEach((targetId) => {
        /* The same File object in several buckets is fine — File is
           immutable and FormData reads it per vehicle it is appended to. */
        const targetBucket = {
          images: [...bucket.images],
          videos: [...bucket.videos],
        };

        setMedia(targetId, targetBucket);
        nextMedia[targetId] = targetBucket;
      });

      setMediaByVehicle((current) => ({ ...current, ...nextMedia }));

      /* Persist only the metadata — File objects are not serialisable */
      setDraft((current) => {
        const vehicles = { ...current.vehicles };

        targetIds.forEach((targetId) => {
          vehicles[targetId] = {
            ...(current.vehicles[targetId] ||
              emptyCampaignDetails(targetId)),
            campaignImages: images,
            campaignVideos: videos,
          };
        });

        return { ...current, vehicles };
      });
    },
    []
  );

  /**
   * Copies one vehicle's campaign details onto every other selected vehicle.
   *
   * Campaign fields, media and promoter details travel. Dates travel too —
   * they are part of "campaign details" per the flow — and are written to the
   * cart, not the draft, so each vehicle still owns its own dates and can be
   * changed back individually straight afterwards. Nothing vehicle-specific
   * (which vehicle it is, its rate, its quantity) is touched.
   */
  const handleApplyToAll = useCallback(
    (sourceVehicleId, checked) => {
      const id = String(sourceVehicleId);

      const vehicleIds = selectedVehicles.map((vehicle) =>
        String(vehicle.id)
      );

      /* ── Unticking: hand every other vehicle back what it had ────────────
         Only the copies go. Whatever the customer typed on each card before
         ticking the box returns — details, dates and files — and the source
         card keeps its own values, which were never a copy of anything. */
      if (!checked) {
        const snapshotDates = draftRef.current.appliedDates;
        const snapshotMedia = mediaSnapshotRef.current;

        setDraft((current) => restoreDetailsFromSnapshot(current));

        if (snapshotMedia) {
          const nextMedia = {};

          Object.keys(snapshotMedia).forEach((vehicleId) => {
            const bucket = snapshotMedia[vehicleId];

            setMedia(vehicleId, bucket);
            nextMedia[vehicleId] = bucket;
          });

          setMediaByVehicle((current) => ({ ...current, ...nextMedia }));

          mediaSnapshotRef.current = null;
        }

        if (snapshotDates) {
          setSelectedVehicles((current) => {
            const next = current.map((vehicle) => {
              const range = snapshotDates[String(vehicle.id)];

              if (!range) return vehicle;

              return {
                ...vehicle,
                startDate: parseStoredDate(range.startDate),
                endDate: parseStoredDate(range.endDate),
              };
            });

            persistCart(next);

            return next;
          });
        }

        toast.success("Each vehicle is back to its own campaign details.");

        return;
      }

      /* ── Ticking: snapshot first, then copy ─────────────────────────── */
      const currentDates = {};

      selectedVehicles.forEach((vehicle) => {
        currentDates[String(vehicle.id)] = {
          startDate: vehicle.startDate
            ? formatDateForApi(vehicle.startDate)
            : null,
          endDate: vehicle.endDate
            ? formatDateForApi(vehicle.endDate)
            : null,
        };
      });

      const mediaSnapshot = {};

      vehicleIds.forEach((vehicleId) => {
        if (vehicleId === id) return;

        const bucket = getMedia(vehicleId);

        mediaSnapshot[vehicleId] = {
          images: [...bucket.images],
          videos: [...bucket.videos],
        };
      });

      mediaSnapshotRef.current = mediaSnapshot;

      setDraft((current) =>
        applyDetailsToAll(current, id, vehicleIds, currentDates)
      );

      copyMediaToAll(id, vehicleIds);

      const sourceMedia = getMedia(id);

      setMediaByVehicle(() => {
        const next = {};

        vehicleIds.forEach((vehicleId) => {
          next[vehicleId] =
            vehicleId === id ? sourceMedia : getMedia(vehicleId);
        });

        return next;
      });

      const source = selectedVehicles.find(
        (vehicle) => String(vehicle.id) === id
      );

      if (source) {
        setSelectedVehicles((current) => {
          const next = current.map((vehicle) => ({
            ...vehicle,
            startDate: source.startDate,
            endDate: source.endDate,
          }));

          persistCart(next);

          return next;
        });
      }

      setErrors({});

      toast.success("Campaign details applied to all selected vehicles.");
    },
    [selectedVehicles, persistCart]
  );

  /* ── Pricing ───────────────────────────────────────────────────────────
     One row per vehicle carrying everything the cards, the floating bar,
     the review popup and the submitted payload all need — built once so
     none of them can disagree about a number. */
  const rows = useMemo(() => {
    return selectedVehicles.map((vehicle) => {
      const id = String(vehicle.id);
      const details = draft.vehicles[id] || emptyCampaignDetails(id);

      const pricing = priceVehicleLine({
        startDate: vehicle.startDate,
        endDate: vehicle.endDate,
        quantity: vehicle.quantity,
        rate: vehicle.rate,
        packageDetails: vehicle.packageDetails,
        needPromoter: details.needPromoter,
        promoterQuantity: details.promoterQuantity,
      });

      return {
        vehicle,
        details,
        pricing,
        media: mediaByVehicle[id] || { images: [], videos: [] },
      };
    });
  }, [selectedVehicles, draft, mediaByVehicle]);

  const pricedLines = useMemo(
    () => rows.map((row) => row.pricing),
    [rows]
  );

  const pricing = useMemo(
    () =>
      priceOrder(
        pricedLines,
        parseFloat(GST_Percentage),
        agencyBusiness?.gst_number
      ),
    [pricedLines, agencyBusiness]
  );

  const activeDateVehicle = useMemo(
    () =>
      selectedVehicles.find(
        (vehicle) => String(vehicle.id) === String(activeDateVehicleId)
      ),
    [selectedVehicles, activeDateVehicleId]
  );

  /* ── Stepper ───────────────────────────────────────────────────────────
     One vehicle is edited at a time. `activeIndex` is clamped rather than
     reset when the list shrinks, so removing a vehicle on the previous step
     cannot leave the stepper pointing past the end. */
  const activeRow = rows[activeIndex] || rows[0] || null;

  /* Checked = every vehicle genuinely shares one set of campaign details */
  const appliedToAll = Boolean(draft.appliedToAllFrom);

  useEffect(() => {
    if (activeIndex > rows.length - 1) {
      setActiveIndex(Math.max(rows.length - 1, 0));
    }
  }, [rows.length, activeIndex]);

  /* Which vehicles are fully filled in — drives the rail ticks and the
     "n of m completed" counter. Derived from the same rules the Review
     button enforces, so the two can never disagree. */
  const completedIds = useMemo(() => {
    const complete = new Set<string>();

    rows.forEach(({ vehicle, details }) => {
      if (!Object.keys(getVehicleErrors(vehicle, details)).length) {
        complete.add(String(vehicle.id));
      }
    });

    return complete;
  }, [rows]);

  const completedCount = completedIds.size;

  const focusStepper = useCallback(() => {
    stepperRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const goToVehicle = useCallback(
    (index: number) => {
      setActiveIndex(Math.min(Math.max(index, 0), rows.length - 1));
      focusStepper();
    },
    [rows.length, focusStepper]
  );

  const goToPreviousVehicle = useCallback(() => {
    goToVehicle(activeIndex - 1);
  }, [goToVehicle, activeIndex]);

  /* Advancing validates the vehicle being left behind, so mistakes surface
     on the step that owns them rather than all at once at the end. */
  const goToNextVehicle = useCallback(() => {
    if (!activeRow) return;

    const id = String(activeRow.vehicle.id);

    const vehicleErrors = getVehicleErrors(
      activeRow.vehicle,
      activeRow.details
    );

    if (Object.keys(vehicleErrors).length) {
      setErrors((current) => ({ ...current, [id]: vehicleErrors }));

      toast.error(
        `Complete the campaign details for vehicle ${activeIndex + 1}.`
      );

      return;
    }

    goToVehicle(activeIndex + 1);
  }, [activeRow, activeIndex, goToVehicle]);

  /* ── Validation ────────────────────────────────────────────────────── */
  const validate = () => {
    const nextErrors = {};

    rows.forEach(({ vehicle, details }) => {
      const vehicleErrors = getVehicleErrors(vehicle, details);

      if (Object.keys(vehicleErrors).length) {
        nextErrors[String(vehicle.id)] = vehicleErrors;
      }
    });

    setErrors(nextErrors);

    return nextErrors;
  };

  const handleReviewOrder = () => {
    if (!user) {
      toast.error("Please login to continue booking.");
      openAuth("login");
      return;
    }

    const nextErrors = validate();

    const firstInvalidId = Object.keys(nextErrors)[0];

    if (firstInvalidId) {
      const index = rows.findIndex(
        ({ vehicle }) => String(vehicle.id) === firstInvalidId
      );

      toast.error(
        `Complete the campaign details for vehicle ${index + 1}.`
      );

      /* Open the offending vehicle's step — with one card on screen at a
         time, scrolling to it is not enough on its own. */
      if (index >= 0) goToVehicle(index);

      return;
    }

    /* Draft and cart are already persisted on every edit, so the popup
       reads the very state that was just validated. */
    setReviewOpen(true);
  };

  /* "Edit" on a vehicle inside the review popup: close the popup and open
     that vehicle's step. Its values live in the campaign draft already, so
     the form renders prefilled — there is nothing to fetch or hand over. */
  const handleEditVehicle = useCallback(
    (vehicleId) => {
      setReviewOpen(false);

      const index = rows.findIndex(
        ({ vehicle }) => String(vehicle.id) === String(vehicleId)
      );

      goToVehicle(index >= 0 ? index : 0);
    },
    [rows, goToVehicle]
  );

  /* Send Request, from inside the review popup. Only a successful send
     leaves this page — a failure keeps the popup open with the error
     toasted, so nothing the customer typed is lost. */
  const handleSubmitOrder = useCallback(async () => {
    if (submitting) return;

    if (!user?._id) {
      toast.error("Please login to submit your campaign request.");
      openAuth("login");
      return;
    }

    try {
      setSubmitting(true);

      const created = await submitClientRequest({
        user,
        isAgency,
        agencyBusiness,
        rows,
        pricing,
        formatDateForApi,
      });

      sessionStorage.setItem(
        "roadshow_last_client_request",
        JSON.stringify(created)
      );

      /* The request is placed — neither the cart nor the draft is needed */
      clearCart(user?._id);
      clearCampaignDraft(user?._id);
      hydratedUserKeyRef.current = null;
      hydratedDraftRef.current = null;

      setReviewOpen(false);

      toast.success("Booking request submitted successfully.");

      router.push(
        `/roadshow/booking-request-submitted/${created._id}`
      );
    } catch (error) {
      console.error("Campaign request error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to submit the campaign request."
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    submitting,
    user,
    isAgency,
    agencyBusiness,
    rows,
    pricing,
    openAuth,
    router,
  ]);

  if (loading) {
    return (
      <main className="rdsw_cdLoading">
        <LoaderCircle className="h-5 w-5 animate-spin" />
        Loading campaign details...
      </main>
    );
  }

  return (
    <main className="rdsw_cdPage">
      <section className="rdsw_cdShell">
        {/* ── Stepper ──────────────────────────────────────────────────────
            Navigable, not decorative: step 1 returns to customer + vehicle
            selection and step 3 opens the review popup (validating first),
            so the three steps behave the way a stepper looks like it should. */}
        <header className="rdsw_cdPageHeader">
          <ol className="rdsw_cdSteps">
            <li>
              <button
                type="button"
                onClick={() => router.push("/roadshow/CampaignRequest")}
                className="rdsw_cdStep rdsw_cdStepDone"
              >
                <span>1</span>Customer &amp; Vehicles
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => goToVehicle(0)}
                aria-current="step"
                className="rdsw_cdStep rdsw_cdStepActive"
              >
                <span>2</span>Campaign Details
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={handleReviewOrder}
                className="rdsw_cdStep"
              >
                <span>3</span>Review Order
              </button>
            </li>
          </ol>

          <h1 className="rdsw_cdPageTitle">Campaign Details</h1>

          <p className="rdsw_cdPageSubtitle">
            Tell us how each vehicle should run. Every selected vehicle keeps
            its own campaign, dates and promoter requirement.
          </p>
        </header>

        <div className="rdsw_cdLayout">
          {/* ── Vehicle stepper ────────────────────────────────────────────
              One vehicle at a time instead of a wall of stacked cards. The
              rail above is both the progress indicator and the navigation:
              each chip shows the vehicle, whether its details are complete,
              and jumps straight to it. */}
          <div className="rdsw_cdCardList" ref={stepperRef}>
            {/* The rail stays put whether or not "apply to all" is checked.
                Hiding it on check took the customer's only way of SEEING
                where those details landed — they had to uncheck the box to
                look, which is exactly what they were trying to avoid. With
                it visible they can walk both vehicles and confirm. */}
            {rows.length > 1 && (
              <div className="rdsw_cdRailWrap">
                <div className="rdsw_cdRailHead">
                  <p className="rdsw_cdRailTitle">
                    Vehicle {activeIndex + 1} of {rows.length}
                  </p>

                  <p className="rdsw_cdRailMeta">
                    {appliedToAll
                      ? `Shared across all ${rows.length} vehicles`
                      : `${completedCount} of ${rows.length} completed`}
                  </p>
                </div>

                <div
                  className="rdsw_cdRailProgress"
                  role="progressbar"
                  aria-valuenow={completedCount}
                  aria-valuemin={0}
                  aria-valuemax={rows.length}
                >
                  <span
                    style={{
                      width: `${(completedCount / rows.length) * 100}%`,
                    }}
                  />
                </div>

                <div className="rdsw_cdRail">
                  {rows.map(({ vehicle }, index) => {
                    const id = String(vehicle.id);
                    const isActive = index === activeIndex;
                    const isComplete = completedIds.has(id);
                    const hasError = Boolean(errors[id]);

                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => goToVehicle(index)}
                        aria-current={isActive ? "step" : undefined}
                        className={[
                          "rdsw_cdRailItem",
                          isActive ? "rdsw_cdRailItemActive" : "",
                          hasError ? "rdsw_cdRailItemError" : "",
                        ].join(" ")}
                      >
                        <span className="rdsw_cdRailThumb">
                          <img
                            src={vehicle.image || FALLBACK_VEHICLE_IMAGE}
                            alt=""
                            onError={(event) => {
                              const image = event.currentTarget;

                              if (image.src !== FALLBACK_VEHICLE_IMAGE) {
                                image.src = FALLBACK_VEHICLE_IMAGE;
                              }
                            }}
                          />

                          {isComplete && !hasError && (
                            <span className="rdsw_cdRailTick">
                              <Check size={10} strokeWidth={3.5} />
                            </span>
                          )}
                        </span>

                        <span className="rdsw_cdRailCopy">
                          <span className="rdsw_cdRailIndex">
                            Vehicle {index + 1}
                          </span>

                          <span className="rdsw_cdRailName">
                            {vehicle.name}
                          </span>
                        </span>

                        <Pencil
                          size={13}
                          className="rdsw_cdRailPencil"
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeRow && (
              <div id={`rdsw_cdCard_${String(activeRow.vehicle.id)}`}>
                <VehicleCampaignCard
                  index={activeIndex}
                  vehicle={activeRow.vehicle}
                  pricing={activeRow.pricing}
                  details={activeRow.details}
                  media={activeRow.media}
                  campaignTypes={campaignTypes}
                  languageOptions={LANGUAGE_OPTIONS}
                  errors={errors[String(activeRow.vehicle.id)]}
                  showApplyToAll={rows.length > 1}
                  /* Checked on EVERY card while the details are shared, not
                     just the one they were copied from — a customer stepping
                     to vehicle 2 and finding the box empty reads it as "this
                     one did not get them". Unchecking from any card unlinks
                     them all, which handleApplyToAll already does. */
                  appliedToAll={appliedToAll}
                  isApplySource={
                    draft.appliedToAllFrom ===
                    String(activeRow.vehicle.id)
                  }
                  onApplyToAllChange={(checked) =>
                    handleApplyToAll(
                      String(activeRow.vehicle.id),
                      checked
                    )
                  }
                  onDetailsChange={(patch) =>
                    updateDetails(String(activeRow.vehicle.id), patch)
                  }
                  onMediaChange={(bucket) =>
                    updateMedia(String(activeRow.vehicle.id), bucket)
                  }
                  onEditDates={() =>
                    setActiveDateVehicleId(String(activeRow.vehicle.id))
                  }
                  onQuantityChange={(quantity) =>
                    updateSelectedVehicle(String(activeRow.vehicle.id), {
                      quantity: Math.max(Number(quantity) || 1, 1),
                    })
                  }
                  onChangeVehicle={() =>
                    router.push("/roadshow/CampaignRequest")
                  }
                />
              </div>
            )}

            {/* ── Step navigation ──────────────────────────────────────── */}
            <div className="rdsw_cdStepNav">
              {rows.length === 1 ? (
                <span className="rdsw_cdStepNavNote">
                  One vehicle in this campaign
                </span>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={goToPreviousVehicle}
                    disabled={activeIndex === 0}
                    className="rdsw_cdStepNavBtn"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  {/* Sharing is stated ALONGSIDE the navigation now, not
                      instead of it, so the customer keeps both the fact and
                      the means to go and check it. Each state keeps the
                      class it already had, so nothing about the bar moves. */}
                  {appliedToAll ? (
                    <span className="rdsw_cdStepNavNote">
                      These details apply to all {rows.length} vehicles
                    </span>
                  ) : (
                    <span className="rdsw_cdStepNavCount">
                      {activeIndex + 1} / {rows.length}
                    </span>
                  )}
                </>
              )}

              {activeIndex < rows.length - 1 ? (
                <button
                  type="button"
                  onClick={goToNextVehicle}
                  className="rdsw_cdStepNavBtn rdsw_cdStepNavBtnPrimary"
                >
                  Next Vehicle
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleReviewOrder}
                  className="rdsw_cdStepNavBtn rdsw_cdStepNavBtnPrimary"
                >
                  Review Order
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>

          {/* ── Running summary ────────────────────────────────────────── */}
          <aside className="rdsw_cdSummary">
            <div className="rdsw_cdSummaryCard">
              <h2 className="rdsw_cdSummaryTitle">Estimate</h2>

              <div className="rdsw_cdSummaryRows">
                <div className="rdsw_cdSummaryRow">
                  <span>Vehicle Rental</span>
                  <span>{formatMoney(pricing.rentalTotal)}</span>
                </div>

                {/* Optional charges appear only when they apply — a row of
                    ₹0.00 reads as a calculation that failed rather than as
                    a charge that was never incurred. */}
                {pricing.promoterTotal > 0 && (
                  <div className="rdsw_cdSummaryRow">
                    <span>Promoter Charges</span>
                    <span>{formatMoney(pricing.promoterTotal)}</span>
                  </div>
                )}

                {pricing.rtoTotal > 0 && (
                  <div className="rdsw_cdSummaryRow">
                    <span>RTO Charges</span>
                    <span>{formatMoney(pricing.rtoTotal)}</span>
                  </div>
                )}

                <div className="rdsw_cdSummaryRow">
                  <span>Taxable Amount</span>
                  <span>{formatMoney(pricing.taxableAmount)}</span>
                </div>

                <div className="rdsw_cdSummaryRow">
                  <span>GST {pricing.gstPercentage}%</span>
                  <span>{formatMoney(pricing.gstAmount)}</span>
                </div>

                <div className="rdsw_cdSummaryRow rdsw_cdSummaryTotalRow">
                  <span>Estimated Total</span>
                  <strong>{formatMoney(pricing.grandTotal)}</strong>
                </div>
              </div>

              <p className="rdsw_cdSummaryNote">
                Note: This is an estimated cost. The final quotation may vary
                based on campaign requirements, branding, fabrication,
                logistics, and other applicable charges.
              </p>
            </div>
          </aside>
        </div>

        {/* ── Actions ──────────────────────────────────────────────────── */}
        <div className="rdsw_cdActions">
          <button
            type="button"
            onClick={() => router.push("/roadshow/CampaignRequest")}
            className="rdsw_cdBackButton"
          >
            <ChevronLeft size={16} />
            Back to Vehicles
          </button>
        </div>

        {/* ── Floating summary bar ───────────────────────────────────────
            Mirrors the bar on the CampaignRequest step so the count and the
            running total stay visible while the customer works.

            It lives INSIDE the page section and uses `position: sticky`
            rather than `fixed` — exactly as .rdsw_crfStickyBar does on the
            CampaignRequest step. Fixed kept it pinned to the viewport for
            the whole document, so it sat on top of the CTA band and the
            footer once the customer scrolled past the form. Sticky pins it
            only while this section is on screen and lets it scroll away
            naturally when the footer arrives.

            Hidden while the review popup is open so the two never overlap. */}
        <AnimatePresence>
        {rows.length > 0 && !reviewOpen && (
          <motion.div
            className="rdsw_cdStickyBar"
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 32,
            }}
          >
            <div className="rdsw_cdStickyBarInner">
              <div className="rdsw_cdStickyBarInfo">
                <span className="rdsw_cdStickyBarCount">
                  {rows.length}
                </span>

                <span className="rdsw_cdStickyBarLabel">
                  {rows.length === 1
                    ? "Vehicle added"
                    : "Vehicles added"}
                </span>
              </div>

              <div className="rdsw_cdStickyBarTotal">
                <span className="rdsw_cdStickyBarTotalLabel">
                  Estimated Total
                </span>

                <span className="rdsw_cdStickyBarTotalValue">
                  {formatMoney(pricing.grandTotal)}
                </span>

                <span className="rdsw_cdStickyBarTotalNote">
                  incl. {pricing.gstPercentage}% GST
                </span>
              </div>

              <button
                type="button"
                onClick={handleReviewOrder}
                className="rdsw_cdStickyBarButton"
              >
                Review Order
                <ChevronRight size={15} />
              </button>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </section>

      <ReviewOrderModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        rows={rows}
        pricing={pricing}
        user={user}
        agencyBusiness={agencyBusiness}
        mediaMissing={hasPendingMedia(draft)}
        submitting={submitting}
        onSubmit={handleSubmitOrder}
        onEditVehicle={handleEditVehicle}
      />

      {/* Shared picker — same component and props the CampaignRequest page
          uses, so the date rules are literally the same code. */}
      {activeDateVehicle && (
        <DatePicker
          checkIn={activeDateVehicle.startDate}
          checkOut={activeDateVehicle.endDate}
          setCheckIn={(date) =>
            updateSelectedVehicle(activeDateVehicle.id, {
              startDate: date,
            })
          }
          setCheckOut={(date) =>
            updateSelectedVehicle(activeDateVehicle.id, {
              endDate: date,
            })
          }
          open
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setActiveDateVehicleId(null);
          }}
          showInputCard={false}
          popupMode="dialog"
          title="Select campaign dates"
        />
      )}
    </main>
  );
}
