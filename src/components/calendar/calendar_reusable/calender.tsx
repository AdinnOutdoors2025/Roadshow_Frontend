"use client";

import { useState, useRef, useEffect, useMemo, useCallback, } from "react";
import { createPortal } from "react-dom";
import { useScrollLock } from "@/hooks/useScrollLock";
import {
  addMonths,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
  startOfMonth,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  formatDate,
  getInclusiveDayCount,
} from "@/app/utils/currency";

export type CalendarPopupMode =
  | "dropdown"
  | "dialog";

export type DatePickerProps = {
  checkIn: Date | null;
  checkOut: Date | null;
  setCheckIn: (date: Date | null) => void;
  setCheckOut: (date: Date | null) => void;

  /* Controlled open state. Leave undefined on Vehicle Details. */
  open?: boolean;

  /* Receives calendar open/close changes. */
  onOpenChange?: (open: boolean) => void;

  /* Keep true for Vehicle Details. * Set false when the page already has its own date buttons. */
  showInputCard?: boolean;

  /* dropdown = Vehicle Details floating popup dialog = Campaign Request centered modal */
  popupMode?: CalendarPopupMode;

  title?: string;
  minimumDate?: Date;
};

const WEEKDAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

export default function Calendar({
  checkIn,
  checkOut,
  setCheckIn,
  setCheckOut,
  open,
  onOpenChange,
  showInputCard = true,
  popupMode = "dropdown",
  title = "Select campaign dates",
  minimumDate,
}: DatePickerProps) {
  const [internalOpen, setInternalOpen] =
    useState(false);

  const [mounted] = useState(
    () => typeof document !== "undefined"
  );

  const minSelectableDate = useMemo(
    () => startOfDay(minimumDate ?? new Date()),
    [minimumDate]
  );

  const [visibleMonth, setVisibleMonth] =
    useState(() =>
      startOfMonth(checkIn ?? minSelectableDate)
    );

  const calendarRef = useRef<HTMLDivElement>(null);
  const previousOpenRef = useRef(false);

  const isControlled = open !== undefined;
  const isOpen = isControlled
    ? Boolean(open)
    : internalOpen;

  const setCalendarOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange]
  );

  const daysSelected = checkIn
    ? checkOut
      ? getInclusiveDayCount(checkIn, checkOut)
      : 1
    : 0;

  useEffect(() => {
    if (isOpen && !previousOpenRef.current) {
      setVisibleMonth(
        startOfMonth(checkIn ?? minSelectableDate)
      );
    }

    previousOpenRef.current = isOpen;
  }, [isOpen, checkIn, minSelectableDate]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setCalendarOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [isOpen, setCalendarOpen]);

  useEffect(() => {
    if (
      !isOpen ||
      popupMode !== "dropdown"
    ) {
      return;
    }

    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(
          event.target as Node
        )
      ) {
        setCalendarOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [
    isOpen,
    popupMode,
    setCalendarOpen,
  ]);

  useScrollLock(isOpen && popupMode === "dialog");

  const handleClear = () => {
    setCheckIn(null);
    setCheckOut(null);
  };

  const handleDateSelect = (date: Date) => {
    const selectedDate = startOfDay(date);
    const start = checkIn
      ? startOfDay(checkIn)
      : null;
    const end = checkOut
      ? startOfDay(checkOut)
      : null;

    if (isBefore(selectedDate, minSelectableDate)) {
      return;
    }

    // No start date selected yet.
    if (!start) {
      setCheckIn(selectedDate);
      setCheckOut(null);
      return;
    }

    // Only the start date is selected.
    if (!end) {
      if (isBefore(selectedDate, start)) {
        setCheckIn(selectedDate);
        setCheckOut(null);
        return;
      }

      // Selecting the same day is allowed as a one-day campaign.
      setCheckOut(selectedDate);
      return;
    }

    // Both dates already exist: modify or restart the range.
    if (isSameDay(selectedDate, start)) {
      setCheckOut(null);
      return;
    }

    if (isAfter(selectedDate, start)) {
      setCheckOut(selectedDate);
      return;
    }

    setCheckIn(selectedDate);
    setCheckOut(null);
  };

  const renderMonth = (month: Date) => {
    const firstDay = startOfMonth(month);
    const lastDay = endOfMonth(firstDay);
    const startingDayOfWeek = firstDay.getDay();

    const days = Array.from(
      { length: lastDay.getDate() },
      (_, index) =>
        new Date(
          firstDay.getFullYear(),
          firstDay.getMonth(),
          index + 1
        )
    );

    return (
      <div
        className="flex min-w-[320px] flex-1 flex-col items-center bg-white p-4"
        style={{ borderRadius: "15px" }}
      >
        <h3
          className="mb-3 text-center font-semibold text-gray-700"
          style={{ fontSize: "20px" }}
        >
          {format(firstDay, "MMMM yyyy")}
        </h3>

        <div className="mb-2 grid w-full grid-cols-7 gap-x-3 gap-y-2 text-center text-xl font-normal text-gray-500">
          {WEEKDAYS.map((day) => (
            <div key={day} className="w-10">
              {day[0]}
            </div>
          ))}
        </div>

        <div className="grid w-full grid-cols-7 justify-items-center gap-x-2 gap-y-2">
          {Array.from({
            length: startingDayOfWeek,
          }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="h-10 w-10"
            />
          ))}

          {days.map((date) => {
            const normalizedDate =
              startOfDay(date);

            const isPast = isBefore(
              normalizedDate,
              minSelectableDate
            );

            const isSelectedStart = checkIn
              ? isSameDay(date, checkIn)
              : false;

            const isSelectedEnd = checkOut
              ? isSameDay(date, checkOut)
              : false;

            const startTime = checkIn
              ? startOfDay(checkIn).getTime()
              : null;

            const endTime = checkOut
              ? startOfDay(checkOut).getTime()
              : startTime;

            const currentTime =
              normalizedDate.getTime();

            const isSelectedRange =
              startTime !== null &&
              endTime !== null &&
              currentTime >=
              Math.min(startTime, endTime) &&
              currentTime <=
              Math.max(startTime, endTime);

            return (
              <button
                key={date.toISOString()}
                type="button"
                disabled={isPast}
                onClick={() =>
                  handleDateSelect(date)
                }
                aria-pressed={
                  isSelectedRange
                }
                className={`
                  flex h-10 w-10 items-center justify-center
                  rounded-[20px] text-lg transition
                  ${isPast
                    ? "cursor-not-allowed bg-white text-gray-300 opacity-40"
                    : isSelectedRange
                      ? "bg-black font-semibold text-white"
                      : "bg-white font-normal text-gray-800 hover:bg-gray-200"
                  }
                  ${isSelectedStart ||
                    isSelectedEnd
                    ? "ring-2 ring-black ring-offset-1"
                    : ""
                  }
                `}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const minimumVisibleMonth = startOfMonth(
    minSelectableDate
  );

  const canGoToPreviousMonth = isAfter(
    startOfMonth(visibleMonth),
    minimumVisibleMonth
  );

  const calendarPanel = (
    <div
      ref={calendarRef}
      className={
        popupMode === "dialog"
          ? "fixed left-1/2 top-1/2 z-9999 max-h-[calc(100vh-24px)] w-[calc(100vw-24px)] max-w-190 -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-4 shadow-[0_30px_90px_rgba(0,0,0,0.28)] sm:p-6 rdsw-thin-scrollbar"
          : "absolute left-1/2 top-full z-50 mt-2 max-h-[calc(100vh-24px)] w-[calc(100vw-24px)] max-w-190 -translate-x-1/2 overflow-y-auto rounded-2xl bg-white p-4 shadow-lg sm:p-6 rdsw-thin-scrollbar"
      }
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={!canGoToPreviousMonth}
          onClick={() =>
            setVisibleMonth((current) =>
              addMonths(current, -1)
            )
          }
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-black transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </button>

        <p className="text-center text-[14px] font-medium text-gray-600">
          {title}
        </p>

        <button
          type="button"
          onClick={() =>
            setVisibleMonth((current) =>
              addMonths(current, 1)
            )
          }
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-black transition hover:bg-gray-100"
          aria-label="Next month"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex w-full flex-col justify-start gap-2 overflow-x-auto md:flex-row">
        {renderMonth(visibleMonth)}

        <div className="hidden flex-1 md:block">
          {renderMonth(
            addMonths(visibleMonth, 1)
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-between gap-4 border-t border-gray-100 pt-4">
        <button
          type="button"
          className="rounded-lg bg-gray-200 px-5 py-3 transition hover:bg-gray-300"
          onClick={handleClear}
        >
          Clear dates
        </button>

        <button
          type="button"
          className="rounded-lg bg-black px-5 py-3 text-white transition hover:bg-gray-800"
          onClick={() =>
            setCalendarOpen(false)
          }
        >
          Close
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div
        className={`relative w-full ${showInputCard
            ? "flex justify-center"
            : ""
          }`}
      >
        {showInputCard && (
          <div
            className="mx-auto w-full max-w-4xl bg-white p-6"
            style={{
              borderRadius: "20px",
              boxShadow:
                "0 10px 25px rgba(0,0,0,0.1)",
            }}
          >
            <h2 className="mb-4 text-xl font-semibold">
              {daysSelected}{" "}
              {daysSelected === 1
                ? "day"
                : "days"}{" "}
              selected
            </h2>

            <div className="mb-6 flex flex-col gap-6 sm:flex-row">
              <div className="flex flex-1 flex-col">
                <label className="mb-1 text-[20px] font-normal">
                  Start-Date
                </label>

                <input
                  type="text"
                  readOnly
                  value={formatDate(checkIn, {
                    pattern: "dd/MM/yyyy",
                  })}
                  onClick={() =>
                    setCalendarOpen(!isOpen)
                  }
                  placeholder="Select date"
                  className="w-full cursor-pointer px-4 py-3"
                  style={{
                    borderRadius: "10px",
                    border:
                      "0.5px solid #d1d5db",
                    backgroundColor: "#fff",
                  }}
                />
              </div>

              <div className="flex flex-1 flex-col">
                <label className="mb-1 text-[20px] font-normal">
                  End-Date
                </label>

                <input
                  type="text"
                  readOnly
                  value={formatDate(checkOut, {
                    pattern: "dd/MM/yyyy",
                  })}
                  onClick={() =>
                    setCalendarOpen(!isOpen)
                  }
                  placeholder="Select date"
                  className="w-full cursor-pointer px-4 py-3"
                  style={{
                    borderRadius: "10px",
                    border:
                      "0.5px solid #d1d5db",
                    backgroundColor: "#fff",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {isOpen && popupMode === "dropdown" && calendarPanel}
      </div>

      {isOpen &&
        popupMode === "dialog" &&
        mounted &&
        createPortal(
          <>
            <button
              type="button"
              aria-label="Close calendar"
              onClick={() =>
                setCalendarOpen(false)
              }
              className="fixed inset-0 z-150 cursor-default bg-black/35 backdrop-blur-[1px]"
            />
            {calendarPanel}
          </>,
          document.body,
        )}
    </>
  );
}
