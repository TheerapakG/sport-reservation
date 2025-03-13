// src/components/ui/Calendar.tsx
import React, { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
// Optional icons (lucide-react or similar). Adjust to your icon library.
import { ChevronLeft, ChevronRight } from "lucide-react";

type CalendarProps = {
  initialDate?: string | Dayjs;
};

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Calendar2({ initialDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(
    initialDate ? dayjs(initialDate) : dayjs(),
  );

  // Go to previous/next month
  const handlePrevMonth = () =>
    setCurrentMonth((prev) => prev.subtract(1, "month"));
  const handleNextMonth = () => setCurrentMonth((prev) => prev.add(1, "month"));

  // Start/end of current month
  const startOfMonth = currentMonth.startOf("month");
  const endOfMonth = currentMonth.endOf("month");

  // dayjs: Sunday=0, Monday=1, etc.
  const startDayOfWeek = startOfMonth.day();
  const endDayOfWeek = endOfMonth.day();

  // We want a total of 42 days (6 rows × 7 columns)
  const gridStart = startOfMonth.subtract(startDayOfWeek, "day");
  const gridEnd = endOfMonth.add(6 - endDayOfWeek, "day");

  // Build array of dayjs objects for each cell
  const calendarDays: Dayjs[] = [];
  let tempDate = gridStart.clone();
  while (tempDate.isBefore(gridEnd) || tempDate.isSame(gridEnd, "day")) {
    calendarDays.push(tempDate);
    tempDate = tempDate.add(1, "day");
  }

  const today = dayjs();

  return (
    <div className="w-full max-w-sm rounded-xl border border-gray-200 p-4">
      {/* Header with arrows + month label */}
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="text-[#65D1F8] transition-colors hover:text-[#4A90E2]"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="font-semibold text-[#65D1F8]">
          {currentMonth.format("MMMM YYYY")}
        </div>
        <button
          onClick={handleNextMonth}
          className="text-[#65D1F8] transition-colors hover:text-[#4A90E2]"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day-of-week row */}
      <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500">
        {dayNames.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid (6 rows × 7 columns) */}
      <div className="grid grid-cols-7 text-center">
        {calendarDays.map((day) => {
          // Check if the day is in the current displayed month.
          const isCurrentMonth = day.month() === currentMonth.month();
          // Check if the day is today.
          const isToday = day.isSame(today, "day");

          // Base text color: gray for in‑month days, lighter for out‑of‑month.
          let dayClass = "text-gray-700";
          if (!isCurrentMonth) {
            dayClass = "text-gray-400";
          }

          return (
            <div key={day.toString()} className="py-2">
              {/* Circle highlight for "today" */}
              <div
                className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm ${dayClass} ${
                  isToday ? "bg-[#65D1F8] text-white" : ""
                }`}
              >
                {day.date()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
