"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createPortal } from "react-dom";

type DateTimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  tripStartDate?: string | null;
  onClose?: () => void;
};

type PopoverPosition = {
  top: number;
  left: number;
  width: number;
};

const PICKER_VIEWPORT_MARGIN = 8;
const PICKER_GAP = 8;
const PICKER_MIN_WIDTH = 320;
const PICKER_MAX_WIDTH = 360;
const PICKER_FALLBACK_HEIGHT = 360;

type PopoverPosition = {
  top: number;
  left: number;
  width: number;
};

const PICKER_VIEWPORT_MARGIN = 8;
const PICKER_GAP = 8;
const PICKER_MIN_WIDTH = 320;
const PICKER_MAX_WIDTH = 360;
const PICKER_FALLBACK_HEIGHT = 360;

function getDateFromString(dateStr: string): Date {
  if (!dateStr) return new Date();
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function getTimeParts(dateStr: string): { hour: string; minute: string } {
  if (!dateStr) {
    return {
      hour: "00",
      minute: "00",
    };
  }

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return {
      hour: "00",
      minute: "00",
    };
  }

  return {
    hour: String(date.getHours()).padStart(2, "0"),
    minute: String(date.getMinutes()).padStart(2, "0"),
  };
}

function getTimeParts(dateStr: string): { hour: string; minute: string } {
  if (!dateStr) {
    return {
      hour: "00",
      minute: "00",
    };
  }

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return {
      hour: "00",
      minute: "00",
    };
  }

  return {
    hour: String(date.getHours()).padStart(2, "0"),
    minute: String(date.getMinutes()).padStart(2, "0"),
  };
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
  const [selectedHour, setSelectedHour] = useState(() => getTimeParts(value).hour);
  const [selectedMinute, setSelectedMinute] = useState(() => getTimeParts(value).minute);
  const [popoverPosition, setPopoverPosition] = useState<PopoverPosition | null>(null);
  const [selectedHour, setSelectedHour] = useState(() => getTimeParts(value).hour);
  const [selectedMinute, setSelectedMinute] = useState(() => getTimeParts(value).minute);
  const [popoverPosition, setPopoverPosition] = useState<PopoverPosition | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const closePicker = useCallback(() => {
    setPopoverPosition(null);
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const openPicker = useCallback(() => {
    setSelectedDate(value ? getDateFromString(value) : null);
    setDisplayMonth(getInitialMonth(value, tripStartDate));

    const { hour, minute } = getTimeParts(value);
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setPopoverPosition(null);
    setIsOpen(true);
  }, [tripStartDate, value]);

  const updatePopoverPosition = useCallback(() => {
    if (!isOpen) return;

    const triggerRect = pickerRef.current?.getBoundingClientRect();
    if (!triggerRect) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const panelWidth = Math.min(
      Math.max(triggerRect.width, PICKER_MIN_WIDTH),
      PICKER_MAX_WIDTH,
      viewportWidth - PICKER_VIEWPORT_MARGIN * 2,
    );
    const panelHeight = panelRef.current?.offsetHeight ?? PICKER_FALLBACK_HEIGHT;
    const openBelow =
      triggerRect.bottom + PICKER_GAP + panelHeight <=
      viewportHeight - PICKER_VIEWPORT_MARGIN;
    const top = openBelow
      ? Math.min(
          triggerRect.bottom + PICKER_GAP,
          viewportHeight - panelHeight - PICKER_VIEWPORT_MARGIN,
        )
      : Math.max(
          PICKER_VIEWPORT_MARGIN,
          triggerRect.top - panelHeight - PICKER_GAP,
        );
    const left = Math.min(
      Math.max(triggerRect.left, PICKER_VIEWPORT_MARGIN),
      viewportWidth - panelWidth - PICKER_VIEWPORT_MARGIN,
    );

    setPopoverPosition({
      top,
      left,
      width: panelWidth,
    });
  }, [isOpen]);
  const panelRef = useRef<HTMLDivElement>(null);

  const closePicker = useCallback(() => {
    setPopoverPosition(null);
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const openPicker = useCallback(() => {
    setSelectedDate(value ? getDateFromString(value) : null);
    setDisplayMonth(getInitialMonth(value, tripStartDate));

    const { hour, minute } = getTimeParts(value);
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setPopoverPosition(null);
    setIsOpen(true);
  }, [tripStartDate, value]);

  const updatePopoverPosition = useCallback(() => {
    if (!isOpen) return;

    const triggerRect = pickerRef.current?.getBoundingClientRect();
    if (!triggerRect) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const panelWidth = Math.min(
      Math.max(triggerRect.width, PICKER_MIN_WIDTH),
      PICKER_MAX_WIDTH,
      viewportWidth - PICKER_VIEWPORT_MARGIN * 2,
    );
    const panelHeight = panelRef.current?.offsetHeight ?? PICKER_FALLBACK_HEIGHT;
    const openBelow =
      triggerRect.bottom + PICKER_GAP + panelHeight <=
      viewportHeight - PICKER_VIEWPORT_MARGIN;
    const top = openBelow
      ? Math.min(
          triggerRect.bottom + PICKER_GAP,
          viewportHeight - panelHeight - PICKER_VIEWPORT_MARGIN,
        )
      : Math.max(
          PICKER_VIEWPORT_MARGIN,
          triggerRect.top - panelHeight - PICKER_GAP,
        );
    const left = Math.min(
      Math.max(triggerRect.left, PICKER_VIEWPORT_MARGIN),
      viewportWidth - panelWidth - PICKER_VIEWPORT_MARGIN,
    );

    setPopoverPosition({
      top,
      left,
      width: panelWidth,
    });
  }, [isOpen]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (!isOpen) return;

    const target = event.target as Node;
    const trigger = pickerRef.current;
    const panel = panelRef.current;

    if (trigger?.contains(target) || panel?.contains(target)) {
      return;
    }

    closePicker();
  }, [closePicker, isOpen]);

    const target = event.target as Node;
    const trigger = pickerRef.current;
    const panel = panelRef.current;

    if (trigger?.contains(target) || panel?.contains(target)) {
      return;
    }

    closePicker();
  }, [closePicker, isOpen]);

  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;
    if (event.key === "Escape") {
      closePicker();
      closePicker();
    }
  }, [closePicker, isOpen]);
  }, [closePicker, isOpen]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [handleClickOutside, handleEscapeKey]);

  useEffect(() => {
    if (!isOpen) return;

    const handleReposition = () => updatePopoverPosition();
    const frame = window.requestAnimationFrame(handleReposition);

    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [displayMonth.month, displayMonth.year, isOpen, updatePopoverPosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleReposition = () => updatePopoverPosition();
    const frame = window.requestAnimationFrame(handleReposition);

    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [displayMonth.month, displayMonth.year, isOpen, updatePopoverPosition]);

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
      closePicker();
      closePicker();
    }
  };

  const handleClear = () => {
    setSelectedDate(null);
    setSelectedHour("00");
    setSelectedMinute("00");
    onChange("");
    closePicker();
    closePicker();
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
        onClick={() => {
          if (isOpen) {
            closePicker();
          } else {
            openPicker();
          }
        }}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-left text-sm text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        onClick={() => {
          if (isOpen) {
            closePicker();
          } else {
            openPicker();
          }
        }}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-left text-sm text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
      >
        {formatDisplayDate(value)}
      </button>

      {/* Render the popover outside the main DOM hierarchy to avoid hydration mismatches and CSS stacking-context issues. */}
      {isOpen && typeof document !== "undefined" && createPortal(
        <div
          ref={panelRef}
          className="fixed z-[70] max-w-[calc(100vw-1rem)] rounded-xl border border-slate-200 bg-white p-4 shadow-xl"
          style={{
            top: popoverPosition?.top ?? PICKER_VIEWPORT_MARGIN,
            left: popoverPosition?.left ?? PICKER_VIEWPORT_MARGIN,
            width: popoverPosition?.width ?? PICKER_MIN_WIDTH,
            visibility: popoverPosition ? "visible" : "hidden",
          }}
          ref={panelRef}
          className="fixed z-[70] max-w-[calc(100vw-1rem)] rounded-xl border border-slate-200 bg-white p-4 shadow-xl"
          style={{
            top: popoverPosition?.top ?? PICKER_VIEWPORT_MARGIN,
            left: popoverPosition?.left ?? PICKER_VIEWPORT_MARGIN,
            width: popoverPosition?.width ?? PICKER_MIN_WIDTH,
            visibility: popoverPosition ? "visible" : "hidden",
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
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

          <div className="mb-2 grid grid-cols-7 gap-0.5 text-center">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div
                key={day}
                className="flex h-6 items-center justify-center text-xs font-semibold text-slate-500"
                className="flex h-6 items-center justify-center text-xs font-semibold text-slate-500"
              >
                {day}
              </div>
            ))}
          </div>

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
        </div>,
        document.body,
        </div>,
        document.body,
      )}
    </div>
  );
}
