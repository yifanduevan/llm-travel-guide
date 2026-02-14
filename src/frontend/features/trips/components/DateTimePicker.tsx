"use client";

import { useEffect, useRef, useState } from "react";

type DateTimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  tripStartDate?: string | null;
  onClose?: () => void;
};

function getDateFromString(dateStr: string): Date {
  if (!dateStr) return new Date();
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "Select date & time";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "Select date & time";
  const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
  const monthName = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${dayName} ${monthName} ${day} ${year} · ${hour}:${minute}`;
}

function getInitialMonth(
  currentValue: string,
  tripStartDate?: string | null,
): { year: number; month: number } {
  if (currentValue) {
    const date = new Date(currentValue);
    if (!Number.isNaN(date.getTime())) {
      return { year: date.getFullYear(), month: date.getMonth() };
    }
  }

  if (tripStartDate) {
    const date = new Date(tripStartDate);
    if (!Number.isNaN(date.getTime())) {
      return { year: date.getFullYear(), month: date.getMonth() };
    }
  }

  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

export function DateTimePicker({
  value,
  onChange,
  tripStartDate,
  onClose,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? getDateFromString(value) : null,
  );
  const [displayMonth, setDisplayMonth] = useState(() =>
    getInitialMonth(value, tripStartDate),
  );
  const [selectedHour, setSelectedHour] = useState(() => {
    const date = getDateFromString(value);
    return String(date.getHours()).padStart(2, "0");
  });
  const [selectedMinute, setSelectedMinute] = useState(() => {
    const date = getDateFromString(value);
    return String(date.getMinutes()).padStart(2, "0");
  });
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        onClose?.();
      }
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        onClose?.();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  const monthName = new Date(displayMonth.year, displayMonth.month).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" },
  );

  const daysInMonth = getDaysInMonth(displayMonth.year, displayMonth.month);
  const firstDayOfMonth = getFirstDayOfMonth(displayMonth.year, displayMonth.month);
  const days: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() &&
    displayMonth.month === today.getMonth() &&
    displayMonth.year === today.getFullYear();

  const isSelected = (day: number) =>
    selectedDate &&
    day === selectedDate.getDate() &&
    displayMonth.month === selectedDate.getMonth() &&
    displayMonth.year === selectedDate.getFullYear();

  const handleSelectDay = (day: number) => {
    const newDate = new Date(
      displayMonth.year,
      displayMonth.month,
      day,
      parseInt(selectedHour, 10),
      parseInt(selectedMinute, 10),
    );
    setSelectedDate(newDate);
  };

  const handleConfirm = () => {
    if (selectedDate) {
      const pad = (n: number) => String(n).padStart(2, "0");
      const isoString = `${pad(selectedDate.getFullYear())}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}T${selectedHour}:${selectedMinute}`;
      onChange(isoString);
      setIsOpen(false);
      onClose?.();
    }
  };

  const handleClear = () => {
    setSelectedDate(null);
    setSelectedHour("00");
    setSelectedMinute("00");
    onChange("");
    setIsOpen(false);
    onClose?.();
  };

  const handlePrevMonth = () => {
    if (displayMonth.month === 0) {
      setDisplayMonth({ year: displayMonth.year - 1, month: 11 });
    } else {
      setDisplayMonth({ ...displayMonth, month: displayMonth.month - 1 });
    }
  };

  const handleNextMonth = () => {
    if (displayMonth.month === 11) {
      setDisplayMonth({ year: displayMonth.year + 1, month: 0 });
    } else {
      setDisplayMonth({ ...displayMonth, month: displayMonth.month + 1 });
    }
  };

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-left text-sm text-slate-900 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
      >
        {formatDisplayDate(value)}
      </button>

      {isOpen && (
        <div
          className="absolute top-[-170px] right-40 z-50 mt-2 max-w-[340px] rounded-lg border border-slate-200 bg-white p-4 shadow-md"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Calendar Header */}
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="rounded-lg p-1 hover:bg-slate-100"
            >
              <span className="material-symbols-outlined text-4 text-slate-600">
                chevron_left
              </span>
            </button>
            <h3 className="text-sm font-semibold text-slate-900">{monthName}</h3>
            <button
              type="button"
              onClick={handleNextMonth}
              className="rounded-lg p-1 hover:bg-slate-100"
            >
              <span className="material-symbols-outlined text-4 text-slate-600">
                chevron_right
              </span>
            </button>
          </div>

          {/* Week Days Header */}
          <div className="mb-2 grid grid-cols-7 gap-0.5 text-center">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div
                key={day}
                className="text-xs font-semibold text-slate-500 h-6 flex items-center justify-center"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="mb-4 grid grid-cols-7 gap-0.5">
            {days.map((day, idx) =>
              day === null ? (
                <div key={`empty-${idx}`} className="h-9" />
              ) : (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-9 w-9 rounded-full text-xs font-medium transition ${
                    isSelected(day)
                      ? "bg-slate-900 text-white"
                      : isToday(day)
                        ? "border border-slate-300 text-slate-900"
                        : "text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {day}
                </button>
              ),
            )}
          </div>

          {/* Time Selection */}
          <div className="mb-3 flex items-end gap-2 border-t border-slate-200 pt-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-600">Hour</label>
              <select
                value={selectedHour}
                onChange={(e) => setSelectedHour(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-900"
              >
                {Array.from({ length: 24 }, (_, i) =>
                  String(i).padStart(2, "0"),
                ).map((h) => (
                  <option key={h} value={h}>
                    {h}:00
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-600">Minute</label>
              <select
                value={selectedMinute}
                onChange={(e) => setSelectedMinute(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-900"
              >
                {["00", "15", "30", "45"].map((m) => (
                  <option key={m} value={m}>
                    :{m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedDate}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:bg-slate-400"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
