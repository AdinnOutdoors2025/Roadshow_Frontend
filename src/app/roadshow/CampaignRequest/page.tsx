// /* eslint-disable */
// // @ts-nocheck
// "use client";

// import {
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import {
//   differenceInCalendarDays,
//   parseISO,
// } from "date-fns";
// import toast from "react-hot-toast";

// import { useAuth } from "@/context/AuthContext";
// import {
//   FALLBACK_VEHICLE_IMAGE,
//   fetchAllRoadshowVehicles,
//   type RoadshowVehicle,
// } from "@/lib/roadshowVehicles";

// type SelectedVehicle =
//   RoadshowVehicle & {
//     startDate: string;
//     endDate: string;
//     quantity: number;
//   };

// const getToday = () =>
//   new Date().toISOString().split("T")[0];

// const getDays = (
//   startDate: string,
//   endDate: string
// ) => {
//   if (!startDate || !endDate) return 0;

//   return Math.max(
//     differenceInCalendarDays(
//       parseISO(endDate),
//       parseISO(startDate)
//     ) + 1,
//     0
//   );
// };

// export default function CampaignRequestPage() {
//   const { user, openAuth } = useAuth();

//   const [vehicles, setVehicles] = useState<
//     RoadshowVehicle[]
//   >([]);

//   const [selectedVehicles, setSelectedVehicles] =
//     useState<SelectedVehicle[]>([]);

//   const [loadingVehicles, setLoadingVehicles] =
//     useState(true);

//   const [submitting, setSubmitting] =
//     useState(false);

//   const [currentIndex, setCurrentIndex] =
//     useState(0);

//   const [visibleCount, setVisibleCount] =
//     useState(4);

//   const [clientDetails, setClientDetails] =
//     useState({
//       name: "",
//       phone: "",
//       email: "",
//     });

//   const vehicleSectionRef =
//     useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     if (!user) {
//       toast.error(
//         "Please login to continue booking."
//       );

//       openAuth("login");
//       return;
//     }

//     setClientDetails({
//       name: user?.name || "",
//       phone: user?.phone || "",
//       email: user?.email || "",
//     });
//   }, [user, openAuth]);

//   useEffect(() => {
//     const updateVisibleCount = () => {
//       const width = window.innerWidth;

//       if (width < 640) setVisibleCount(1);
//       else if (width < 900) setVisibleCount(2);
//       else if (width < 1180) setVisibleCount(3);
//       else setVisibleCount(4);
//     };

//     updateVisibleCount();

//     window.addEventListener(
//       "resize",
//       updateVisibleCount
//     );

//     return () => {
//       window.removeEventListener(
//         "resize",
//         updateVisibleCount
//       );
//     };
//   }, []);

//   useEffect(() => {
//     const loadVehicles = async () => {
//       try {
//         setLoadingVehicles(true);

//         const allVehicles =
//           await fetchAllRoadshowVehicles();

//         setVehicles(allVehicles);

//         const storedDraft =
//           sessionStorage.getItem(
//             "roadshow_booking_draft"
//           );

//         if (!storedDraft) return;

//         const draft = JSON.parse(storedDraft);

//         const initialVehicle =
//           allVehicles.find(
//             (vehicle) =>
//               String(vehicle.id) ===
//               String(draft?.vehicleId)
//           );

//         if (!initialVehicle) return;

//         setSelectedVehicles([
//           {
//             ...initialVehicle,
//             startDate:
//               draft?.startDate || "",
//             endDate:
//               draft?.endDate || "",
//             quantity: Number(
//               draft?.quantity || 1
//             ),
//           },
//         ]);
//       } catch (error) {
//         console.error(error);

//         toast.error(
//           error instanceof Error
//             ? error.message
//             : "Unable to load vehicles."
//         );
//       } finally {
//         setLoadingVehicles(false);
//       }
//     };

//     loadVehicles();
//   }, []);

//   const isSelected = (
//     vehicleId: string
//   ) =>
//     selectedVehicles.some(
//       (vehicle) => vehicle.id === vehicleId
//     );

//   const toggleVehicle = (
//     vehicle: RoadshowVehicle
//   ) => {
//     if (isSelected(vehicle.id)) {
//       setSelectedVehicles((current) =>
//         current.filter(
//           (item) => item.id !== vehicle.id
//         )
//       );

//       return;
//     }

//     const firstSelected =
//       selectedVehicles[0];

//     setSelectedVehicles((current) => [
//       ...current,
//       {
//         ...vehicle,
//         startDate:
//           firstSelected?.startDate || "",
//         endDate:
//           firstSelected?.endDate || "",
//         quantity: 1,
//       },
//     ]);
//   };

//   const updateSelectedVehicle = (
//     vehicleId: string,
//     updates: Partial<SelectedVehicle>
//   ) => {
//     setSelectedVehicles((current) =>
//       current.map((vehicle) =>
//         vehicle.id === vehicleId
//           ? {
//               ...vehicle,
//               ...updates,
//             }
//           : vehicle
//       )
//     );
//   };

//   const bookingRows = useMemo(() => {
//     return selectedVehicles.map(
//       (vehicle) => {
//         const days = getDays(
//           vehicle.startDate,
//           vehicle.endDate
//         );

//         return {
//           ...vehicle,
//           days,
//           total:
//             vehicle.rate *
//             days *
//             vehicle.quantity,
//         };
//       }
//     );
//   }, [selectedVehicles]);

//   const grandTotal = useMemo(() => {
//     return bookingRows.reduce(
//       (total, vehicle) =>
//         total + vehicle.total,
//       0
//     );
//   }, [bookingRows]);

//   const validate = () => {
//     if (!clientDetails.name.trim()) {
//       toast.error(
//         "Enter client or company name."
//       );
//       return false;
//     }

//     if (
//       clientDetails.phone.replace(/\D/g, "")
//         .length !== 10
//     ) {
//       toast.error(
//         "Enter a valid phone number."
//       );
//       return false;
//     }

//     if (
//       !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
//         clientDetails.email.trim()
//       )
//     ) {
//       toast.error(
//         "Enter a valid email address."
//       );
//       return false;
//     }

//     if (!selectedVehicles.length) {
//       toast.error(
//         "Select at least one vehicle."
//       );
//       return false;
//     }

//     for (const vehicle of selectedVehicles) {
//       if (
//         !vehicle.startDate ||
//         !vehicle.endDate
//       ) {
//         toast.error(
//           `Select dates for ${vehicle.name}.`
//         );
//         return false;
//       }

//       if (
//         vehicle.endDate <
//         vehicle.startDate
//       ) {
//         toast.error(
//           `Invalid dates for ${vehicle.name}.`
//         );
//         return false;
//       }
//     }

//     return true;
//   };

//   const handleSubmit = () => {
//     if (!validate()) return;

//     setSubmitting(true);

//     const payload = {
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
//             vehicle.vehicleTypeId,
//           vehicleName: vehicle.name,
//           packageId:
//             vehicle.packageDetails?._id ||
//             "",
//           pricePerDay: vehicle.rate,
//           startDate:
//             vehicle.startDate,
//           endDate:
//             vehicle.endDate,
//           days: vehicle.days,
//           quantity:
//             vehicle.quantity,
//           total: vehicle.total,
//         })
//       ),

//       grandTotal,
//     };

//     sessionStorage.setItem(
//       "roadshow_campaign_payload",
//       JSON.stringify(payload)
//     );

//     console.log(
//       "Campaign request payload:",
//       payload
//     );

//     window.setTimeout(() => {
//       setSubmitting(false);

//       toast.success(
//         "Campaign request details prepared successfully."
//       );
//     }, 500);
//   };

//   const maxIndex = Math.max(
//     vehicles.length - visibleCount,
//     0
//   );

//   return (
//     <main className="min-h-screen bg-white px-4 py-12 text-black">
//       <section className="mx-auto grid max-w-[1420px] grid-cols-1 gap-5 lg:grid-cols-[0.68fr_1.32fr]">
//         <aside className="rounded-[20px] bg-[#f7f7f9] p-7">
//           <h1 className="text-[22px] font-semibold">
//             Campaign Request Form
//           </h1>

//           <div className="mt-7 space-y-6">
//             <input
//               type="text"
//               placeholder="Full Name / Company Name *"
//               value={clientDetails.name}
//               onChange={(event) =>
//                 setClientDetails(
//                   (current) => ({
//                     ...current,
//                     name: event.target.value,
//                   })
//                 )
//               }
//               className="w-full border-b border-[#888888] bg-transparent px-1 py-2 outline-none"
//             />

//             <input
//               type="tel"
//               placeholder="Phone Number *"
//               value={clientDetails.phone}
//               maxLength={10}
//               onChange={(event) =>
//                 setClientDetails(
//                   (current) => ({
//                     ...current,
//                     phone:
//                       event.target.value
//                         .replace(/\D/g, "")
//                         .slice(0, 10),
//                   })
//                 )
//               }
//               className="w-full border-b border-[#888888] bg-transparent px-1 py-2 outline-none"
//             />

//             <input
//               type="email"
//               placeholder="Email Address *"
//               value={clientDetails.email}
//               onChange={(event) =>
//                 setClientDetails(
//                   (current) => ({
//                     ...current,
//                     email:
//                       event.target.value,
//                   })
//                 )
//               }
//               className="w-full border-b border-[#888888] bg-transparent px-1 py-2 outline-none"
//             />
//           </div>

//           <div className="mt-7 space-y-4">
//             {selectedVehicles.map(
//               (vehicle) => (
//                 <div
//                   key={vehicle.id}
//                   className="rounded-[16px] bg-white p-4"
//                 >
//                   <div className="flex items-start justify-between gap-3">
//                     <div>
//                       <p className="text-[12px] text-[#777777]">
//                         Vehicle Type
//                       </p>

//                       <p className="mt-1 text-[14px] font-semibold">
//                         {vehicle.name}
//                       </p>
//                     </div>

//                     <button
//                       type="button"
//                       onClick={() =>
//                         toggleVehicle(vehicle)
//                       }
//                       className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f1f1f1] text-[#d70000]"
//                     >
//                       ×
//                     </button>
//                   </div>

//                   <div className="mt-5 grid grid-cols-2 gap-5">
//                     <label>
//                       <span className="text-[12px] text-[#666666]">
//                         Start Date
//                       </span>

//                       <input
//                         type="date"
//                         min={getToday()}
//                         value={
//                           vehicle.startDate
//                         }
//                         onChange={(event) =>
//                           updateSelectedVehicle(
//                             vehicle.id,
//                             {
//                               startDate:
//                                 event.target
//                                   .value,
//                             }
//                           )
//                         }
//                         className="mt-1 w-full border-b border-[#888888] bg-transparent py-2 outline-none"
//                       />
//                     </label>

//                     <label>
//                       <span className="text-[12px] text-[#666666]">
//                         End Date
//                       </span>

//                       <input
//                         type="date"
//                         min={
//                           vehicle.startDate ||
//                           getToday()
//                         }
//                         value={
//                           vehicle.endDate
//                         }
//                         onChange={(event) =>
//                           updateSelectedVehicle(
//                             vehicle.id,
//                             {
//                               endDate:
//                                 event.target
//                                   .value,
//                             }
//                           )
//                         }
//                         className="mt-1 w-full border-b border-[#888888] bg-transparent py-2 outline-none"
//                       />
//                     </label>
//                   </div>

//                   <div className="mt-4">
//                     <p className="text-[12px] text-[#666666]">
//                       Vehicle Quantity
//                     </p>

//                     <div className="mt-2 flex items-center gap-3">
//                       <button
//                         type="button"
//                         onClick={() =>
//                           updateSelectedVehicle(
//                             vehicle.id,
//                             {
//                               quantity:
//                                 Math.max(
//                                   vehicle.quantity -
//                                     1,
//                                   1
//                                 ),
//                             }
//                           )
//                         }
//                         className="h-6 w-6 rounded bg-[#dedede]"
//                       >
//                         −
//                       </button>

//                       <span>
//                         {vehicle.quantity}
//                       </span>

//                       <button
//                         type="button"
//                         onClick={() =>
//                           updateSelectedVehicle(
//                             vehicle.id,
//                             {
//                               quantity:
//                                 vehicle.quantity +
//                                 1,
//                             }
//                           )
//                         }
//                         className="h-6 w-6 rounded bg-[#dedede]"
//                       >
//                         +
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )
//             )}
//           </div>

//           <div className="mt-7 flex gap-3">
//             <button
//               type="button"
//               onClick={handleSubmit}
//               disabled={submitting}
//               className="rounded-full bg-black px-6 py-3 text-[13px] text-white disabled:opacity-60"
//             >
//               {submitting
//                 ? "Submitting..."
//                 : "Submit"}
//             </button>

//             <button
//               type="button"
//               onClick={() =>
//                 vehicleSectionRef.current?.scrollIntoView(
//                   {
//                     behavior: "smooth",
//                   }
//                 )
//               }
//               className="rounded-full bg-[#d9d9dd] px-6 py-3 text-[13px]"
//             >
//               Add More Vehicle
//             </button>
//           </div>
//         </aside>

//         <section>
//           <h2 className="font-bold">
//             Product Details
//           </h2>

//           <p className="mt-1 text-[14px]">
//             Review your roadshow campaign details and confirm your booking.
//           </p>

//           <div
//             ref={vehicleSectionRef}
//             className="mt-5 overflow-hidden"
//           >
//             {loadingVehicles ? (
//               <div className="flex min-h-[230px] items-center justify-center">
//                 Loading vehicles...
//               </div>
//             ) : (
//               <div
//                 className="flex transition-transform duration-500"
//                 style={{
//                   transform: `translateX(-${
//                     currentIndex *
//                     (100 / visibleCount)
//                   }%)`,
//                 }}
//               >
//                 {vehicles.map((vehicle) => {
//                   const selected =
//                     isSelected(vehicle.id);

//                   return (
//                     <article
//                       key={vehicle.id}
//                       className="shrink-0 px-1.5"
//                       style={{
//                         width: `${
//                           100 / visibleCount
//                         }%`,
//                       }}
//                     >
//                       <div className="relative rounded-[16px] bg-[#d9d9d9] p-3">
//                         <input
//                           type="checkbox"
//                           checked={selected}
//                           onChange={() =>
//                             toggleVehicle(vehicle)
//                           }
//                           className="absolute right-3 top-3"
//                         />

//                         <img
//                           src={vehicle.image}
//                           alt={vehicle.name}
//                           className="h-[115px] w-full object-contain"
//                           onError={(event) => {
//                             event.currentTarget.src =
//                               FALLBACK_VEHICLE_IMAGE;
//                           }}
//                         />

//                         <h3 className="mt-2 text-[13px] font-bold">
//                           {vehicle.name}
//                         </h3>

//                         <p className="text-[13px]">
//                           ₹
//                           {vehicle.rate.toLocaleString(
//                             "en-IN"
//                           )}
//                           /Per Day
//                         </p>

//                         <p className="text-[11px] text-[#d70000]">
//                           {vehicle.rating} ★
//                         </p>

//                         <button
//                           type="button"
//                           onClick={() =>
//                             toggleVehicle(vehicle)
//                           }
//                           className="mt-2 w-full rounded-full bg-white py-2 text-[12px]"
//                         >
//                           {selected
//                             ? "✓ Vehicle added"
//                             : "Add Vehicle"}
//                         </button>
//                       </div>
//                     </article>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           <div className="mt-4 flex justify-end gap-2">
//             <button
//               type="button"
//               onClick={() =>
//                 setCurrentIndex(
//                   (current) =>
//                     Math.max(
//                       current - 1,
//                       0
//                     )
//                 )
//               }
//               disabled={currentIndex === 0}
//               className="h-10 w-10 rounded-full border"
//             >
//               ‹
//             </button>

//             <button
//               type="button"
//               onClick={() =>
//                 setCurrentIndex(
//                   (current) =>
//                     Math.min(
//                       current + 1,
//                       maxIndex
//                     )
//                 )
//               }
//               disabled={
//                 currentIndex >= maxIndex
//               }
//               className="h-10 w-10 rounded-full border"
//             >
//               ›
//             </button>
//           </div>

//           <div className="mt-8 overflow-x-auto rounded-[16px] bg-[#f1f1f1]">
//             <table className="w-full min-w-[720px]">
//               <thead className="bg-[#d8d8d8]">
//                 <tr>
//                   {[
//                     "Name",
//                     "Price",
//                     "Days",
//                     "Qty",
//                     "Total",
//                   ].map((heading) => (
//                     <th
//                       key={heading}
//                       className="px-6 py-5 text-left"
//                     >
//                       {heading}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>

//               <tbody>
//                 {bookingRows.map(
//                   (vehicle) => (
//                     <tr
//                       key={vehicle.id}
//                       className="border-b"
//                     >
//                       <td className="px-6 py-6">
//                         {vehicle.name}
//                       </td>

//                       <td className="px-6 py-6">
//                         ₹
//                         {vehicle.rate.toLocaleString(
//                           "en-IN"
//                         )}
//                       </td>

//                       <td className="px-6 py-6">
//                         {vehicle.days} day(s)
//                       </td>

//                       <td className="px-6 py-6">
//                         {vehicle.quantity}
//                       </td>

//                       <td className="px-6 py-6">
//                         ₹
//                         {vehicle.total.toLocaleString(
//                           "en-IN"
//                         )}
//                       </td>
//                     </tr>
//                   )
//                 )}
//               </tbody>

//               {bookingRows.length > 0 && (
//                 <tfoot>
//                   <tr className="bg-[#dedede]">
//                     <td
//                       colSpan={4}
//                       className="px-6 py-5 text-right font-bold"
//                     >
//                       Grand Total
//                     </td>

//                     <td className="px-6 py-5 font-bold">
//                       ₹
//                       {grandTotal.toLocaleString(
//                         "en-IN"
//                       )}
//                     </td>
//                   </tr>
//                 </tfoot>
//               )}
//             </table>
//           </div>
//         </section>
//       </section>
//     </main>
//   );
// }




/* eslint-disable */
// @ts-nocheck
"use client";

import { useEffect, useMemo, useRef, useState, } from "react";
import { addMonths, differenceInCalendarDays, eachDayOfInterval, endOfMonth, endOfWeek, format, isBefore, isSameDay, isSameMonth, isValid, parseISO, startOfDay, startOfMonth, startOfWeek, }from "date-fns";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Minus, Plus, X, } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "@/context/AuthContext";
import { FALLBACK_VEHICLE_IMAGE, fetchAllRoadshowVehicles, type RoadshowVehicle, } from "@/lib/roadshowVehicles";
import './page.css';
type SelectedVehicle = RoadshowVehicle & {
  startDate: Date | null;
  endDate: Date | null;
  quantity: number;
};

type DateRange = {
  start: Date | null;
  end: Date | null;
};

type DateRangeCalendarProps = {
  value: DateRange;
  onChange: (range: DateRange) => void;
  onClose: () => void;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
};

const parseStoredDate = (
  value: string | null | undefined
) => {
  if (!value) return null;

  const parsedDate = parseISO(value);

  return isValid(parsedDate)
    ? parsedDate
    : null;
};

const getBookingDays = (
  startDate: Date | null,
  endDate: Date | null
) => {
  if (!startDate || !endDate) return 0;

  return Math.max(
    differenceInCalendarDays(
      endDate,
      startDate
    ) + 1,
    0
  );
};

const getDateText = (
  date: Date | null,
  placeholder: string
) => {
  return date
    ? format(date, "dd MMM yyyy")
    : placeholder;
};

/*   DATE RANGE CALENDA */
function DateRangeCalendar({
  value,
  onChange,
  onClose,
}: DateRangeCalendarProps) {
  const today = startOfDay(new Date());

  const [visibleMonth, setVisibleMonth] =
    useState(
      startOfMonth(value.start || today)
    );

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [onClose]);

  const getMonthDays = (month: Date) => {
    return eachDayOfInterval({
      start: startOfWeek(
        startOfMonth(month)
      ),
      end: endOfWeek(endOfMonth(month)),
    });
  };

  const isInsideSelectedRange = (
    day: Date
  ) => {
    if (!value.start) return false;

    const startTime = startOfDay(
      value.start
    ).getTime();

    const endTime = value.end
      ? startOfDay(value.end).getTime()
      : startTime;

    const currentTime =
      startOfDay(day).getTime();

    return (
      currentTime >= startTime &&
      currentTime <= endTime
    );
  };

  const handleDateClick = (day: Date) => {
    if (isBefore(day, today)) return;

    if (!value.start || value.end) {
      onChange({
        start: day,
        end: null,
      });

      return;
    }

    if (isBefore(day, value.start)) {
      onChange({
        start: day,
        end: value.start,
      });

      return;
    }

    onChange({
      start: value.start,
      end: day,
    });
  };

  const renderMonth = (month: Date) => {
    const monthDays = getMonthDays(month);

    return (
      <div className="min-w-0 flex-1">
        <div className="mb-5 text-center">
          <h3 className="text-[14px] font-semibold text-[#1d1d1f]">
            {format(month, "MMMM yyyy")}
          </h3>
        </div>

        <div className="mb-2 grid grid-cols-7">
          {[
            "S",
            "M",
            "T",
            "W",
            "T",
            "F",
            "S",
          ].map((dayName, index) => (
            <div
              key={`${dayName}-${index}`}
              className="flex h-7 items-center justify-center text-[10px] font-semibold text-[#969696]"
            >
              {dayName}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {monthDays.map((day) => {
            const belongsToMonth =
              isSameMonth(day, month);

            const isPast = isBefore(
              day,
              today
            );

            const selectedStart =
              value.start
                ? isSameDay(
                    day,
                    value.start
                  )
                : false;

            const selectedEnd = value.end
              ? isSameDay(day, value.end)
              : false;

            const selectedRange =
              isInsideSelectedRange(day);

            return (
              <div
                key={day.toISOString()}
                className="flex items-center justify-center"
              >
                <button
                  type="button"
                  disabled={isPast}
                  onClick={() =>
                    handleDateClick(day)
                  }
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full text-[11px] transition",
                    !belongsToMonth
                      ? "text-[#d2d2d2]"
                      : "text-[#282828]",
                    isPast
                      ? "cursor-not-allowed opacity-25"
                      : "hover:bg-[#eeeeef]",
                    selectedRange
                      ? "!bg-[#1b1b1d] !font-semibold !text-white"
                      : "",
                    selectedStart ||
                    selectedEnd
                      ? "ring-2 ring-[#1b1b1d] ring-offset-1"
                      : "",
                  ].join(" ")}
                >
                  {format(day, "d")}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close calendar"
        onClick={onClose}
        className="fixed inset-0 z-[150] cursor-default bg-black/35 backdrop-blur-[1px]"
      />

      <div className="fixed left-1/2 top-1/2 z-[160] w-[calc(100vw-32px)] max-w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-[22px] border border-black/5 bg-white p-4 shadow-[0_30px_90px_rgba(0,0,0,0.28)] sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              setVisibleMonth(
                (current) =>
                  addMonths(current, -1)
              )
            }
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e5e5] text-[#1d1d1f] transition hover:bg-[#f4f4f4]"
            aria-label="Previous month"
          >
            <ChevronLeft size={17} />
          </button>

          <p className="text-[12px] font-medium text-[#777777]">
            Select campaign dates
          </p>

          <button
            type="button"
            onClick={() =>
              setVisibleMonth(
                (current) =>
                  addMonths(current, 1)
              )
            }
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e5e5] text-[#1d1d1f] transition hover:bg-[#f4f4f4]"
            aria-label="Next month"
          >
            <ChevronRight size={17} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
          {renderMonth(visibleMonth)}

          <div className="hidden sm:block">
            {renderMonth(
              addMonths(visibleMonth, 1)
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-[#eeeeee] pt-4">
          <button
            type="button"
            onClick={() =>
              onChange({
                start: null,
                end: null,
              })
            }
            className="text-[12px] font-medium text-[#777777] underline underline-offset-4 transition hover:text-black"
          >
            Clear dates
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#171719] px-5 py-2.5 text-[12px] font-semibold text-white transition hover:bg-[#d70000]"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}

/* CAMPAIGN REQUEST PAGE */
export default function CampaignRequestPage() {
  const { user, openAuth } = useAuth();

  const productScrollerRef =
    useRef<HTMLDivElement>(null);

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

  const [clientDetails, setClientDetails] =
    useState({
      name: "",
      phone: "",
      email: "",
    });

  /* Logged-in customer information */
  useEffect(() => {
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
  }, [user, openAuth]);

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
      const alreadySelected =
        current.some(
          (item) =>
            item.id === vehicle.id
        );

      if (alreadySelected) {
        return current.filter(
          (item) =>
            item.id !== vehicle.id
        );
      }

      const firstSelected = current[0];

      return [
        ...current,
        {
          ...vehicle,
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
        const days = getBookingDays(
          vehicle.startDate,
          vehicle.endDate
        );

        const rate = Number(
          vehicle.rate || 0
        );

        return {
          ...vehicle,
          days,
          total:
            rate *
            days *
            vehicle.quantity,
        };
      }
    );
  }, [selectedVehicles]);

  const grandTotal = useMemo(() => {
    return bookingRows.reduce(
      (total, vehicle) =>
        total + vehicle.total,
      0
    );
  }, [bookingRows]);

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

  const handleSubmit = async () => {
    if (submitting) return;

    if (!validateForm()) return;

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

            pricePerDay: Number(
              vehicle.rate || 0
            ),

            startDate:
              vehicle.startDate
                ? format(
                    vehicle.startDate,
                    "yyyy-MM-dd"
                  )
                : "",

            endDate:
              vehicle.endDate
                ? format(
                    vehicle.endDate,
                    "yyyy-MM-dd"
                  )
                : "",

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
      <section className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12">
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
                  placeholder="Enter full name or company name"
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
                  placeholder="Enter phone number"
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
                  placeholder="Enter email address"
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
                    className="rdsw_crfAddedVehMain rounded-[18px] border border-black/[0.04] bg-white p-4 shadow-[0_7px_25px_rgba(0,0,0,0.025)]"
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
                        className="rdsw_crfAddedVehHeadingMainBtn flex h-7 w-7 items-center justify-center rounded-full bg-[#f3f3f3] text-[#a00000] transition hover:bg-[#d70000] hover:text-white"
                      >
                        <X size={13} />
                      </button>
                    </div>

                    <label className="block">
                      <span className="mb-2 block text-[11px] font-medium text-[#575757]">
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
                        className="h-10 w-full border-b border-[#bbbbbb] bg-transparent text-[12px] text-black outline-none focus:border-black"
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

                    <div className="mt-5 grid grid-cols-2 gap-4">
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
                            {getDateText(
                              vehicle.startDate,
                              "Select date"
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
                            {getDateText(
                              vehicle.endDate,
                              "Select date"
                            )}
                          </span>
                        </span>
                      </button>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-medium text-[#777777]">
                          Vehicle Quantity
                        </p>

                        <p className="mt-1 text-[11px] text-[#aaaaaa]">
                          Select required vehicles
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 rounded-full bg-[#f3f3f4] p-1">
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
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black shadow-sm transition hover:bg-black hover:text-white"
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
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black shadow-sm transition hover:bg-black hover:text-white"
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
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex min-w-[95px] items-center justify-center gap-2 rounded-full bg-[#1a1a1c] px-6 py-3 text-[12px] font-semibold text-white transition hover:bg-[#d70000] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}

                {submitting
                  ? "Submitting..."
                  : "Submit"}
              </button>

              <button
                type="button"
                onClick={() =>
                  productScrollerRef.current?.scrollIntoView(
                    {
                      behavior: "smooth",
                      block: "center",
                    }
                  )
                }
                className="rounded-full bg-[#dedee1] px-6 py-3 text-[12px] font-semibold text-[#202020] transition hover:bg-[#cfcfd2]"
              >
                Add More Vehicle
              </button>
            </div>
          </aside>

          {/* Product details */}
          <section className="min-w-0">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#d70000]">
                Roadshow booking
              </p>

              <h2 className="mt-1 text-[24px] font-semibold tracking-[-0.025em] text-[#171719] sm:text-[27px]">
                Product Details
              </h2>

              <p className="mt-2 max-w-[500px] text-[13px] leading-5 text-[#676767]">
                Review your roadshow campaign
                vehicles and confirm your
                booking.
              </p>
            </div>

            <div className="mt-6">
              <div
                ref={productScrollerRef}
                className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {loadingVehicles &&
                  Array.from({
                    length: 4,
                  }).map((_, index) => (
                    <div
                      key={index}
                      className="w-[215px] shrink-0 animate-pulse rounded-[18px] bg-[#eeeeef] p-3 sm:w-[225px]"
                    >
                      <div className="h-[105px] rounded-[13px] bg-[#d8d8da]" />

                      <div className="mt-3 h-3 w-4/5 rounded bg-[#d8d8da]" />

                      <div className="mt-2 h-3 w-2/5 rounded bg-[#d8d8da]" />

                      <div className="mt-4 h-9 rounded-full bg-[#dedee0]" />
                    </div>
                  ))}

                {!loadingVehicles &&
                  vehicles.length === 0 && (
                    <div className="flex min-h-[210px] w-full items-center justify-center rounded-[18px] border border-dashed border-[#dddddd] bg-[#fafafa] px-5 text-center">
                      <div>
                        <p className="text-[14px] font-semibold">
                          No vehicles available
                        </p>

                        <p className="mt-1 text-[12px] text-[#777777]">
                          Campaign vehicles could
                          not be found.
                        </p>
                      </div>
                    </div>
                  )}

                {!loadingVehicles &&
                  vehicles.map((vehicle) => {
                    const selected =
                      isSelected(vehicle.id);

                    return (
                      <article
                        key={vehicle.id}
                        className={[
                          "relative w-[215px] shrink-0 snap-start rounded-[18px] border p-3 transition sm:w-[225px]",
                          selected
                            ? "border-[#a8a8a8] bg-[#ececee]"
                            : "border-transparent bg-[#f0f0f1]",
                        ].join(" ")}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            toggleVehicle(
                              vehicle
                            )
                          }
                          aria-label={
                            selected
                              ? `Remove ${vehicle.name}`
                              : `Add ${vehicle.name}`
                          }
                          className={[
                            "absolute right-3 top-3 z-10 flex h-5 w-5 items-center justify-center rounded-[5px] border transition",
                            selected
                              ? "border-[#555555] bg-[#555555] text-white"
                              : "border-[#8b8b8b] bg-white/50 hover:bg-white",
                          ].join(" ")}
                        >
                          {selected && (
                            <Check
                              size={12}
                              strokeWidth={3}
                            />
                          )}
                        </button>

                        <div className="relative h-[105px] w-full overflow-hidden rounded-[13px] bg-[#dedee0]">
                          <img
                            src={
                              vehicle.image ||
                              FALLBACK_VEHICLE_IMAGE
                            }
                            alt={vehicle.name}
                            className="h-full w-full object-contain p-1"
                            onError={(event) => {
                              const image =
                                event.currentTarget;

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

                        <h3 className="mt-3 min-h-[34px] text-[12px] font-semibold leading-[1.35] text-[#1d1d1f]">
                          {vehicle.name}
                        </h3>

                        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                          <span className="text-[11px] font-semibold text-[#1f1f1f]">
                            {formatCurrency(
                              vehicle.rate
                            )}
                            /Per Day
                          </span>
                        </div>

                        {vehicle.rating !==
                          undefined &&
                          vehicle.rating !==
                            null && (
                            <p className="mt-1 text-[9px] font-medium text-[#d70000]">
                              {vehicle.rating} ★
                            </p>
                          )}

                        <button
                          type="button"
                          onClick={() =>
                            toggleVehicle(
                              vehicle
                            )
                          }
                          className={[
                            "mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-full text-[10px] font-semibold transition",
                            selected
                              ? "bg-white text-[#2c6f3b] hover:text-[#d70000]"
                              : "bg-white text-[#1c1c1d] hover:bg-[#1c1c1d] hover:text-white",
                          ].join(" ")}
                        >
                          {selected && (
                            <Check
                              size={12}
                              strokeWidth={2.5}
                            />
                          )}

                          {selected
                            ? "Vehicle added"
                            : "Add Vehicle"}
                        </button>
                      </article>
                    );
                  })}
              </div>

              <div className="mt-1 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() =>
                    scrollProducts("left")
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e2e2e2] bg-white text-[#999999] transition hover:border-black hover:text-black"
                  aria-label="Previous vehicles"
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    scrollProducts("right")
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e2e2e2] bg-white text-[#777777] transition hover:border-black hover:text-black"
                  aria-label="Next vehicles"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Desktop summary table */}
            <div className="mt-7 hidden overflow-hidden rounded-[18px] border border-[#e4e4e4] md:block">
              <div className="grid grid-cols-[1.5fr_0.8fr_0.75fr_0.65fr_0.9fr] bg-[#dededf] px-6 py-4 text-[11px] font-semibold text-[#292929]">
                <span>Name</span>
                <span>Price</span>
                <span>Days</span>
                <span>Qty</span>

                <span className="text-right">
                  Total
                </span>
              </div>

              <div className="divide-y divide-[#d2d2d2] bg-[#f4f4f5]">
                {bookingRows.length ===
                  0 && (
                  <div className="flex min-h-[120px] items-center justify-center px-6 text-[12px] text-[#777777]">
                    Select a vehicle to view
                    the booking summary.
                  </div>
                )}

                {bookingRows.map(
                  (vehicle) => (
                    <div
                      key={vehicle.id}
                      className="grid min-h-[82px] grid-cols-[1.5fr_0.8fr_0.75fr_0.65fr_0.9fr] items-center px-6 py-4 text-[11px] text-[#222222]"
                    >
                      <span className="pr-3 font-medium">
                        {vehicle.name}
                      </span>

                      <span>
                        {formatCurrency(
                          vehicle.rate
                        )}
                      </span>

                      <span>
                        {vehicle.days} day(s)
                      </span>

                      <span>
                        {vehicle.quantity}{" "}
                        vehicle(s)
                      </span>

                      <span className="text-right font-medium">
                        {formatCurrency(
                          vehicle.total
                        )}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Mobile summary */}
            <div className="mt-7 space-y-3 md:hidden">
              <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-semibold">
                  Booking summary
                </h3>

                <span className="rounded-full bg-[#f1f1f2] px-3 py-1 text-[10px] font-semibold text-[#656565]">
                  {bookingRows.length}{" "}
                  vehicle
                  {bookingRows.length === 1
                    ? ""
                    : "s"}
                </span>
              </div>

              {bookingRows.length === 0 && (
                <div className="rounded-[18px] border border-dashed border-[#dddddd] bg-[#fafafa] px-5 py-8 text-center text-[12px] text-[#777777]">
                  Select a vehicle to view the
                  booking summary.
                </div>
              )}

              {bookingRows.map(
                (vehicle) => (
                  <article
                    key={vehicle.id}
                    className="rounded-[18px] border border-[#e6e6e6] bg-[#f7f7f8] p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-[13px] font-semibold text-[#1c1c1d]">
                          {vehicle.name}
                        </h4>

                        <p className="mt-1 text-[11px] text-[#737373]">
                          {vehicle.days} day(s) ·{" "}
                          {vehicle.quantity}{" "}
                          vehicle(s)
                        </p>
                      </div>

                      <p className="shrink-0 text-[13px] font-semibold">
                        {formatCurrency(
                          vehicle.total
                        )}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[#dedede] pt-3">
                      <span className="text-[10px] text-[#777777]">
                        Price per day
                      </span>

                      <span className="text-[11px] font-medium">
                        {formatCurrency(
                          vehicle.rate
                        )}
                      </span>
                    </div>
                  </article>
                )
              )}
            </div>
          </section>
        </div>
      </section>

      {activeDateVehicle && (
        <DateRangeCalendar
          value={{
            start:
              activeDateVehicle.startDate,
            end: activeDateVehicle.endDate,
          }}
          onChange={(range) =>
            updateSelectedVehicle(
              activeDateVehicle.id,
              {
                startDate: range.start,
                endDate: range.end,
              }
            )
          }
          onClose={() =>
            setActiveDateVehicleId(null)
          }
        />
      )}
    </main>
  );
}