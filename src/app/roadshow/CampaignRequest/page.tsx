/* eslint-disable */
// @ts-nocheck
"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState,} from "react";
import { isBefore } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Minus, Plus, Send, SquarePen, X,} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

import DatePicker from "@/components/calendar/calendar_reusable/calender";
import { ButtonHover as VehicleCrfSubmitBtn } from "@/components/Client/Reusable_Components/ButtonHover";
import { ButtonHover as VehicleCrfAddMoreVehBtn } from "@/components/Client/Reusable_Components/ButtonHover";
import '../../../components/Client/HomePageSections/HomePageSection1.css';

import { useModal } from "@/hooks/useModal";
import { useAuth } from "@/context/AuthContext";
import { FALLBACK_VEHICLE_IMAGE, fetchAllRoadshowVehicles, type RoadshowVehicle,} from "@/lib/roadshowVehicles";
import { GST_Percentage } from '../../../BaseUrl'
import "./page.css";
import { formatCurrency, formatDate, formatDateForApi, getInclusiveDayCount, parseStoredDate, toSafeNumber,} from "@/app/utils/currency";
type SelectedVehicle = RoadshowVehicle & {
  startDate: Date | null;
  endDate: Date | null;
  quantity: number;
};

/* CAMPAIGN REQUEST PAGE */
export default function CampaignRequestPage() {
  const { user, openAuth, authLoading } = useAuth();

  const productScrollerRef =
    useRef<HTMLDivElement>(null);

  const cardNodesRef = useRef(
    new Map<string, HTMLElement>()
  );

  const cardPositionsRef = useRef(
    new Map<string, DOMRect>()
  );

  const authPromptedRef = useRef(false);

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

  useEffect(() => {
    if (!isReviewOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeReviewModal();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
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

        const storedDraft =
          sessionStorage.getItem(
            "roadshow_booking_draft"
          );

        if (!storedDraft) return;

        let draft = null;

        try {
          draft = JSON.parse(storedDraft);
        } catch {
          sessionStorage.removeItem(
            "roadshow_booking_draft"
          );

          return;
        }

        const initialVehicle =
          apiVehicles.find(
            (vehicle) =>
              String(vehicle.id) ===
              String(draft?.vehicleId)
          );

        if (!initialVehicle) return;

        setSelectedVehicles([
          {
            ...initialVehicle,
            startDate: parseStoredDate(
              draft?.startDate
            ),
            endDate: parseStoredDate(
              draft?.endDate
            ),
            quantity: Math.max(
              Number(draft?.quantity || 1),
              1
            ),
          },
        ]);
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

  /* FLIP animation: slide cards to their new spot instead of jumping */
  useLayoutEffect(() => {
    const newPositions = new Map<string, DOMRect>();

    cardNodesRef.current.forEach((node, id) => {
      newPositions.set(id, node.getBoundingClientRect());
    });

    newPositions.forEach((newRect, id) => {
      const oldRect = cardPositionsRef.current.get(id);
      const node = cardNodesRef.current.get(id);

      if (!oldRect || !node) return;

      const deltaX = oldRect.left - newRect.left;
      const deltaY = oldRect.top - newRect.top;

      if (!deltaX && !deltaY) return;

      node.style.transition = "none";
      node.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

      requestAnimationFrame(() => {
        node.style.transition = "transform 320ms ease";
        node.style.transform = "";
      });
    });

    cardPositionsRef.current = newPositions;
  }, [sortedVehicles]);

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
  };

  const removeVehicle = (
    vehicleId: string
  ) => {
    setSelectedVehicles((current) =>
      current.filter(
        (vehicle) =>
          vehicle.id !== vehicleId
      )
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

  const handleConfirmSend = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);

      const payload = {
        clientId: user?._id || "",

        clientDetails: {
          name: clientDetails.name.trim(),

          phone:
            clientDetails.phone.replace(
              /\D/g,
              ""
            ),

          email:
            clientDetails.email
              .trim()
              .toLowerCase(),
        },

        vehicles: bookingRows.map(
          (vehicle) => ({
            vehicleId: vehicle.id,

            vehicleTypeId:
              vehicle.vehicleTypeId ||
              "",

            vehicleName: vehicle.name,

            packageId:
              vehicle.packageDetails
                ?._id || "",

            pricePerDay: toSafeNumber(
              vehicle.rate || 0
            ),

            startDate: formatDateForApi(
              vehicle.startDate
            ),

            endDate: formatDateForApi(
              vehicle.endDate
            ),

            days: vehicle.days,

            quantity:
              vehicle.quantity,

            total: vehicle.total,
          })
        ),

        grandTotal,
      };

      /*
       * Save the prepared request for the next
       * booking/checkout page.
       *
       * Replace this with your create campaign
       * request POST API after the endpoint is ready.
       */
      sessionStorage.setItem(
        "roadshow_campaign_payload",
        JSON.stringify(payload)
      );

      console.log(
        "Campaign request payload:",
        payload
      );

      toast.success(
        "Campaign request prepared successfully."
      );

      closeReviewModal();
    } catch (error) {
      console.error(
        "Campaign request error:",
        error
      );

      toast.error(
        "Unable to prepare campaign request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white pb-20 pt-8 text-[#171719] sm:pt-10 lg:pt-14">
      <section className="mx-auto w-full  px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(320px,0.76fr)_minmax(0,1.28fr)] lg:items-start xl:gap-10">
          {/* Campaign request form */}
          <aside className="rounded-[26px] bg-[#f7f7f8] p-5 sm:p-6 lg:sticky lg:top-24 rdsw_CrfLeftMain">
            <div className="mb-7 rdsw_CrfLeftHeadingMain">
              <div className="text-[20px] font-semibold tracking-[-0.02em] text-[#1b1b1d] rdsw_CrfLeftHeading1">
                Campaign Request Form
              </div>
            </div>

            <div className="space-y-5">
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
                  placeholder="Full Name / Company Name *"
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
                          disabled={
                            vehicle.availableVehicles > 0 &&
                            vehicle.quantity >=
                            vehicle.availableVehicles
                          }
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
                label="Submit"
                loadingLabel="Submitting..."
                loading={submitting}
                disabled={submitting}
                ariaLabel="Submit campaign request"
                onClick={handleReviewSubmit}
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
          {/* Product details */}
          <section className="rdsw_crfProdDetailsMain min-w-0">
            {/* Section heading */}
            <div className="rdsw_crfProdDetailsHeadingWrapper">
              <p className="rdsw_crfProdDetails1stHeading">
                Roadshow booking
              </p>

              <h2 className="rdsw_crfProdDetails2ndHeading">
                Product Details
              </h2>

              <p className="rdsw_crfProdDetailsDesc">
                Review your roadshow campaign details and confirm your booking.
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
                                ? "Vehicle added"
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

      {isReviewOpen && (
      <div className="fixed inset-0 z-99999 flex items-center justify-center overflow-y-auto">
        <div
          className="fixed inset-0 h-full w-full bg-black/35 backdrop-blur-[1px]"
          onClick={closeReviewModal}
        />

        <div
          className="rdsw_reviewModalShell relative w-full"
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
              </div>
            </div>

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
      </div>
      )}
    </main>
  );
}