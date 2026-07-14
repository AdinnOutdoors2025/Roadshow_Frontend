"use client";

import { useState, useRef, useEffect } from "react";
import {
  format,
  differenceInCalendarDays,
  isSameDay,
  isAfter,
  isBefore,
  addMonths,
  startOfMonth,
  endOfMonth,
  startOfDay,
} from "date-fns";

export type DatePickerProps = {
  checkIn: Date | null;
  checkOut: Date | null;
  setCheckIn: (date: Date | null) => void;
  setCheckOut: (date: Date | null) => void;
};

export default function Calendar({ checkIn, checkOut, setCheckIn, setCheckOut }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Math.abs ensures correct positive day count even if selections are inverted
  const daysSelected =
    checkIn && checkOut
      ? Math.abs(differenceInCalendarDays(checkOut, checkIn)) + 1
      : checkIn
      ? 1
      : 0;

  const handleClear = () => {
    setCheckIn(null);
    setCheckOut(null);
  };

  const handleDateSelect = (date: Date) => {
    const selectedDate = startOfDay(date);
    const start = checkIn ? startOfDay(checkIn) : null;
    const end = checkOut ? startOfDay(checkOut) : null;

    // Case 1: No dates are selected yet
    if (!start) {
      setCheckIn(selectedDate);
      setCheckOut(null);
      return;
    }

    // Case 2: Only Check-In is selected
    if (start && !end) {
      if (isSameDay(selectedDate, start)) return; // Prevent selecting the exact same day
      
      if (isBefore(selectedDate, start)) {
        // If clicking before current check-in, set it as the new start date
        setCheckIn(selectedDate);
      } else {
        // Clicking after sets the end date
        setCheckOut(selectedDate);
      }
      return;
    }

    // Case 3: Both Check-In and Check-Out are already selected (Modifying the range)
    if (start && end) {
      if (isSameDay(selectedDate, start)) {
        // Clicking the exact start date clears the end date
        setCheckOut(null);
      } else if (isAfter(selectedDate, start)) {
        // Best Practice: Clicking any date after check-in updates the end date (shrinking or expanding)
        setCheckOut(selectedDate);
      } else {
        // Clicking before check-in resets this date as the new start date
        setCheckIn(selectedDate);
        setCheckOut(null);
      }
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const renderCalendar = () => {
    const today = startOfDay(new Date());
    const months = Array.of(0, 1);

    return (
      <div className="flex flex-col md:flex-row justify-start gap-2 w-full">
        {months.map((offset) => {
          const firstDay = addMonths(startOfMonth(today), offset);
          const lastDay = endOfMonth(firstDay);
          
          // Fix: Get the day of the week (0-6) for the first of the month to add empty grid spaces
          const startingDayOfWeek = firstDay.getDay();

          const days = Array.from({ length: lastDay.getDate() }, (_, i) =>
            new Date(firstDay.getFullYear(), firstDay.getMonth(), i + 1)
          );

          return (
            <div
              key={offset}
              className="flex flex-col items-center p-4 bg-[#ffffff]"
              style={{ borderRadius: "15px", minWidth: "320px" }}
            >
              <h3 className="text-center font-semibold mb-3 text-gray-700" style={{ fontSize: "20px" }}>
                {format(firstDay, "MMMM yyyy")}
              </h3>

              <div className="grid grid-cols-7 gap-x-3 gap-y-2 text-center text-xl font-regular text-gray-500 mb-2 w-full">
                {weekdays.map((day) => (
                  <div key={day} className="w-10">
                    {day[0]}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-x-2 gap-y-2 w-full justify-items-center">
                {/* Empty placeholders to align the 1st of the month under the correct weekday */}
                {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                  <div key={`empty-${index}`} className="w-10 h-10" />
                ))}

                {days.map((date) => {
                  const currentDayNormalized = startOfDay(date);
                  const isPast = isBefore(currentDayNormalized, today);

                  const minDate = checkIn && checkOut ? (isBefore(checkIn, checkOut) ? checkIn : checkOut) : null;
                  const maxDate = checkIn && checkOut ? (isAfter(checkIn, checkOut) ? checkIn : checkOut) : null;

                  const isSelected =
                    (minDate && maxDate && currentDayNormalized >= startOfDay(minDate) && currentDayNormalized <= startOfDay(maxDate)) ||
                    (checkIn && !checkOut && isSameDay(date, checkIn));

                  return (
                    <button
                      key={date.toISOString()}
                      disabled={isPast}
                      onClick={() => handleDateSelect(date)}
                      className={`
                        flex items-center justify-center
                        w-10 h-10
                        rounded-[20px]
                        text-lg
                        transition
                        ${isPast 
                          ? "bg-white text-gray-300 opacity-40 cursor-not-allowed" 
                          : isSelected 
                            ? "bg-black text-white font-semibold" 
                            : "bg-white text-gray-800 font-normal hover:bg-gray-200"
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
        })}
      </div>
    );
  };

  return (
    <div className="relative w-full flex justify-center" ref={calendarRef}>
      {/* Input Container */}
      <div className="p-6 w-full max-w-4xl mx-auto bg-[#ffffff]" style={{ borderRadius: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
        <h2 className="text-xl font-semibold mb-4">
          {daysSelected} {daysSelected === 1 ? "day" : "days"} selected
        </h2>

        <div className="flex flex-col sm:flex-row gap-6 mb-6">
          <div className="flex-1 flex flex-col">
            <label className="text-[20px] font-regular mb-1">Start-Date</label>
            <input
              type="text"
              readOnly
              value={checkIn ? format(checkIn, "dd/MM/yyyy") : ""}
              onClick={() => setOpen(!open)}
              placeholder="Select date"
              className="w-full px-4 py-3 cursor-pointer"
              style={{
                borderRadius: "10px",
                border: "0.5px solid #d1d5db",
                backgroundColor: "#fff",
              }}
            />
          </div>

          <div className="flex-1 flex flex-col">
            <label className="text-[20px] font-regular mb-1">End-Date</label>
            <input
              type="text"
              readOnly
              value={checkOut ? format(checkOut, "dd/MM/yyyy") : ""}
              onClick={() => setOpen(!open)}
              placeholder="Select date"
              className="w-full px-4 py-3 cursor-pointer"
              style={{
                borderRadius: "10px",
                border: "0.5px solid #d1d5db",
                backgroundColor: "#fff",
              }}
            />
          </div>
        </div>
      </div>

      {/* Floating Calendar Popup */}
      {open && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 z-50 mt-2 p-6 bg-[#ffffff] rounded-2xl shadow-lg w-fit">
          {renderCalendar()}

          <div className="flex justify-between mt-6">
            <button className="px-5 py-3 bg-gray-200 rounded-lg hover:bg-gray-300" onClick={handleClear}>
              Clear dates
            </button>
            <button className="px-5 py-3 bg-black text-white rounded-lg hover:bg-gray-800" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
