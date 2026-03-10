"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  formatPickerTimeToDisplay,
  formatTimePickerPartsToValue,
  HOUR_OPTIONS,
  MINUTE_OPTIONS,
  parsePickerTimeToParts,
  type TimePickerParts,
} from "./timeUtils";

type ItineraryTimePickerProps = {
  value: string;
  onChange: (nextValue: string) => void;
};

export default function ItineraryTimePicker({
  value,
  onChange,
}: ItineraryTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const selectedTimeParts = useMemo(() => parsePickerTimeToParts(value), [value]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  const updatePickerTime = (next: Partial<TimePickerParts>) => {
    const merged: TimePickerParts = { ...selectedTimeParts, ...next };
    onChange(formatTimePickerPartsToValue(merged));
  };

  const openTimePicker = () => setIsOpen(true);
  const closeTimePicker = () => setIsOpen(false);

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={openTimePicker}
        className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-left text-sm text-slate-900 shadow-sm transition hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-slate-900">
          {formatPickerTimeToDisplay(value) || "Select time"}
        </span>
        <span className="material-symbols-outlined text-base text-slate-500">
          schedule
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-30 mt-2 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Hour
              </p>
              <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
                {HOUR_OPTIONS.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => updatePickerTime({ hour12: hour })}
                    className={`w-full rounded-md px-2 py-1 text-sm font-medium transition ${
                      selectedTimeParts.hour12 === hour
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {hour.toString().padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Minute
              </p>
              <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
                {MINUTE_OPTIONS.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => updatePickerTime({ minute })}
                    className={`w-full rounded-md px-2 py-1 text-sm font-medium transition ${
                      selectedTimeParts.minute === minute
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {minute.toString().padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Period
              </p>
              <div className="space-y-1">
                {(["AM", "PM"] as const).map((meridiem) => (
                  <button
                    key={meridiem}
                    type="button"
                    onClick={() => updatePickerTime({ meridiem })}
                    className={`w-full rounded-md px-3 py-1 text-sm font-semibold transition ${
                      selectedTimeParts.meridiem === meridiem
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {meridiem}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                closeTimePicker();
              }}
              className="rounded-md px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
