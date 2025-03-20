// src/components/calendar-real.tsx
import React, { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CalendarProps = {
  onDateSelect?: (dateString: string) => void;
};

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Calendar2({ onDateSelect }: CalendarProps) {
  // Force the current month to March 2023
  const today = dayjs();
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDay, setSelectedDay] = useState<Dayjs>(today);

  // When the selected day changes, call onDateSelect (if provided)
  useEffect(() => {
    if (onDateSelect) {
      onDateSelect(selectedDay.format("YYYY-MM-DD"));
    }
  }, [selectedDay, onDateSelect]);

  const handlePrevMonth = () => {
    const newMonth = currentMonth.subtract(1, "month");
    setCurrentMonth(newMonth);
    // Optionally, reset selection or leave it unchanged
  };

  const handleNextMonth = () => {
    const newMonth = currentMonth.add(1, "month");
    setCurrentMonth(newMonth);
    // Optionally, reset selection or leave it unchanged
  };

  const startOfMonth = currentMonth.startOf("month");
  const endOfMonth = currentMonth.endOf("month");
  const startDayOfWeek = startOfMonth.day();
  const endDayOfWeek = endOfMonth.day();

  const gridStart = startOfMonth.subtract(startDayOfWeek, "day");
  const gridEnd = endOfMonth.add(6 - endDayOfWeek, "day");

  const calendarDays: Dayjs[] = [];
  let tempDate = gridStart.clone();
  while (tempDate.isBefore(gridEnd) || tempDate.isSame(gridEnd, "day")) {
    calendarDays.push(tempDate);
    tempDate = tempDate.add(1, "day");
  }

  const handleDayClick = (day: Dayjs) => {
    setSelectedDay(day);
    if (onDateSelect) {
      onDateSelect(day.format("YYYY-MM-DD"));
    }
  };

  return (
    <div className="relative rounded-xl bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] p-[3px]">
      <div className="rounded-xl bg-white p-4">
        {/* Header with month navigation */}
        <div className="mb-2 flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            className="text-[#F28382] transition-colors hover:text-[#4A90E2]"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="font-semibold text-[#F28382]">
            {currentMonth.format("MMMM YYYY")}
          </div>
          <button
            onClick={handleNextMonth}
            className="text-[#F28382] transition-colors hover:text-[#4A90E2]"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Day-of-week header */}
        <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500">
          {dayNames.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 text-center">
          {calendarDays.map((day) => {
            const isCurrentMonth = day.month() === currentMonth.month();
            const isSelected = day.isSame(selectedDay, "day");
            const baseClass = isSelected
              ? "bg-[#65D1F8] text-white"
              : isCurrentMonth
                ? "text-gray-700"
                : "text-gray-400";
            return (
              <div key={day.toString()} className="py-2">
                <button
                  onClick={() => handleDayClick(day)}
                  className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm ${baseClass} transition hover:bg-gray-200`}
                >
                  {day.date()}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
