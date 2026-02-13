"use client";

import { useRef, useState, useEffect } from "react";
import { DayPicker, type DateRange as DayPickerDateRange } from "react-day-picker";
import { format, parse } from "date-fns";

type DateRangePickerProps = {
  startDate: string | null;
  endDate: string | null;
  onChange: (start: string | null, end: string | null) => void;
  placeholder?: string;
};

export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
  placeholder = "Select dates",
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [range, setRange] = useState<DayPickerDateRange>({
    from: startDate ? parse(startDate, "yyyy-MM-dd", new Date()) : undefined,
    to: endDate ? parse(endDate, "yyyy-MM-dd", new Date()) : undefined,
  });
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Convert Date to ISO string (local date, not UTC)
  const dateToISO = (date: Date | undefined): string | null => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Format range summary for display (with year)
  const getRangeSummary = (): string => {
    if (!range.from && !range.to) {
      return placeholder;
    }
    if (range.from && !range.to) {
      return `${format(range.from, "MMM d, yyyy EEE")} → …`;
    }
    return `${format(range.from!, "MMM d, yyyy EEE")} → ${format(range.to!, "MMM d, yyyy EEE")}`;
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (newRange: DayPickerDateRange | undefined) => {
    const updatedRange = newRange || { from: undefined, to: undefined };
    setRange(updatedRange);
    // Update parent state immediately on every selection change
    onChange(dateToISO(updatedRange.from), dateToISO(updatedRange.to));
  };

  const handleConfirm = () => {
    // Parent state already updated via handleSelect, just close
    setIsOpen(false);
  };

  const handleClear = () => {
    setRange({ from: undefined, to: undefined });
    onChange(null, null);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-slate-900 outline-none transition hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
      >
        <span className="text-slate-700">{getRangeSummary()}</span>
      </button>

      {/* Popover Panel - Centered with scoped wrapper */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="date-range-popover absolute left-1/2 -translate-x-1/2 top-full z-50 mt-2 w-[720px] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white shadow-xl"
        >
          {/* Header Section */}
          <div className="border-b border-slate-200 px-6 py-5">
            {/* Range Summary */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                {getRangeSummary()}
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="rounded-lg p-2 hover:bg-slate-100 transition text-slate-700 cursor-pointer flex-shrink-0"
                aria-label="Previous month"
              >
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              <div className="flex-1 text-center text-sm font-medium text-slate-700">
                {format(currentMonth, "MMMM yyyy")} — {format(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
                  "MMMM yyyy"
                )}
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                className="rounded-lg p-2 hover:bg-slate-100 transition text-slate-700 cursor-pointer flex-shrink-0"
                aria-label="Next month"
              >
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Calendar */}
          <div className="px-8 py-6">
            <DayPicker
              mode="range"
              selected={range}
              onSelect={handleSelect}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              numberOfMonths={2}
              showOutsideDays={true}
            />
          </div>

          {/* Footer with Buttons */}
          <div className="border-t border-slate-200 px-6 py-4 flex justify-between items-center gap-3 bg-slate-50 rounded-b-2xl">
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 outline-none transition hover:bg-slate-50"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="inline-flex btn-primary rounded-lg px-6 py-2.5 text-sm font-medium outline-none transition"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
