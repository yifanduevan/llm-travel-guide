"use client";

import { useMemo, useState } from "react";
import type { TransportMode } from "../../iconMap";
import type { TransportSegment } from "../TripWorkspace";
import { DateTimePicker } from "../DateTimePicker";

const modeOptions: Array<{ value: TransportMode; label: string }> = [
  { value: "FLIGHT", label: "Flight" },
  { value: "BUS", label: "Bus" },
  { value: "CAR", label: "Car" },
  { value: "SHIP", label: "Ship" },
  { value: "WALKING", label: "Walking" },
  { value: "TRAIN", label: "Train" },
  { value: "OTHERS", label: "Others" },
];

type AddSegmentFormState = {
  mode: TransportMode;
  customModeName: string;
  fromLocation: string;
  toLocation: string;
  departureTime: string;
  arrivalTime: string;
  confirmationCode: string;
  ticketsUrl: string;
  notes: string;
  completed: boolean;
};

type FormErrors = Partial<
  Record<
    | "mode"
    | "customModeName"
    | "fromLocation"
    | "toLocation"
    | "departureTime"
    | "arrivalTime"
    | "confirmationCode",
    string
  >
>;

type AddSegmentModalProps = {
  onSave: (segment: TransportSegment) => void;
  onClose: () => void;
};

export default function AddSegmentModal({ onSave, onClose }: AddSegmentModalProps) {
  const [formState, setFormState] = useState<AddSegmentFormState>({
    mode: "FLIGHT",
    customModeName: "",
    fromLocation: "",
    toLocation: "",
    departureTime: "",
    arrivalTime: "",
    confirmationCode: "",
    ticketsUrl: "",
    notes: "",
    completed: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const isWalking = formState.mode === "WALKING";
  const isOthers = formState.mode === "OTHERS";
  const isFlight = formState.mode === "FLIGHT";

  const modeLabel = useMemo(() => {
    if (isOthers) {
      return formState.customModeName.trim() || "Custom";
    }
    const match = modeOptions.find((option) => option.value === formState.mode);
    return match?.label ?? "Segment";
  }, [formState.mode, formState.customModeName, isOthers]);

  const handleSave = () => {
    const nextErrors: FormErrors = {};

    if (!formState.mode) nextErrors.mode = "Select a mode.";
    if (!formState.fromLocation.trim()) {
      nextErrors.fromLocation = "Departure location is required.";
    }
    if (!formState.toLocation.trim()) {
      nextErrors.toLocation = "Arrival location is required.";
    }
    if (!formState.departureTime) {
      nextErrors.departureTime = "Select departure date and time.";
    }
    if (!formState.arrivalTime) {
      nextErrors.arrivalTime = "Select arrival date and time.";
    }
    if (isOthers && !formState.customModeName.trim()) {
      nextErrors.customModeName = "Custom mode name is required.";
    }
    if (isFlight && !formState.confirmationCode.trim()) {
      nextErrors.confirmationCode = "Confirmation code is required for flights.";
    }

    if (formState.departureTime && formState.arrivalTime) {
      const departure = new Date(formState.departureTime).getTime();
      const arrival = new Date(formState.arrivalTime).getTime();
      if (!Number.isNaN(departure) && !Number.isNaN(arrival) && departure > arrival) {
        nextErrors.arrivalTime = "Arrival must be after departure.";
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const title = isOthers
      ? `${formState.customModeName.trim()} to ${formState.toLocation.trim()}`
      : `${modeLabel} to ${formState.toLocation.trim()}`;

    const confirmationCode = isWalking
      ? null
      : formState.confirmationCode.trim() || null;
    const ticketsUrl = isWalking ? null : formState.ticketsUrl.trim() || null;

    const newSegment: TransportSegment = {
      id: crypto.randomUUID(),
      mode: formState.mode,
      customModeName: isOthers ? formState.customModeName.trim() : undefined,
      type: formState.mode,
      title,
      startTime: formState.departureTime,
      startTz: null,
      startLocation: formState.fromLocation.trim(),
      endTime: formState.arrivalTime,
      endTz: null,
      endLocation: formState.toLocation.trim(),
      durationText: formatDuration(formState.departureTime, formState.arrivalTime),
      status: "upcoming",
      confirmationCode,
      ticketsUrl,
      ticketUrl: ticketsUrl,
      notes: formState.notes.trim() || null,
      completed: formState.completed,
    };

    onSave(newSegment);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Add segment
              </p>
              <h4 className="mt-1 text-lg font-semibold text-slate-900">
                New transportation segment
              </h4>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
              aria-label="Close"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="grid gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Mode <span className="text-rose-600">*</span>
              </label>
              <select
                value={formState.mode}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    mode: event.target.value as TransportMode,
                  }))
                }
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                {modeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.mode && (
                <p className="mt-1 text-xs text-rose-600">{errors.mode}</p>
              )}
            </div>

            {isOthers && (
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Custom mode name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formState.customModeName}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      customModeName: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                />
                {errors.customModeName && (
                  <p className="mt-1 text-xs text-rose-600">
                    {errors.customModeName}
                  </p>
                )}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  From <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formState.fromLocation}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      fromLocation: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                />
                {errors.fromLocation && (
                  <p className="mt-1 text-xs text-rose-600">
                    {errors.fromLocation}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  To <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formState.toLocation}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      toLocation: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                />
                {errors.toLocation && (
                  <p className="mt-1 text-xs text-rose-600">
                    {errors.toLocation}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Departure <span className="text-rose-600">*</span>
                </label>
                <DateTimePicker
                  value={formState.departureTime}
                  onChange={(value) =>
                    setFormState((prev) => ({ ...prev, departureTime: value }))
                  }
                />
                {errors.departureTime && (
                  <p className="mt-1 text-xs text-rose-600">
                    {errors.departureTime}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Arrival <span className="text-rose-600">*</span>
                </label>
                <DateTimePicker
                  value={formState.arrivalTime}
                  onChange={(value) =>
                    setFormState((prev) => ({ ...prev, arrivalTime: value }))
                  }
                />
                {errors.arrivalTime && (
                  <p className="mt-1 text-xs text-rose-600">
                    {errors.arrivalTime}
                  </p>
                )}
              </div>
            </div>

            {!isWalking && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Confirmation code{isFlight && (
                      <span className="text-rose-600">*</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={formState.confirmationCode}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        confirmationCode: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  />
                  {errors.confirmationCode && (
                    <p className="mt-1 text-xs text-rose-600">
                      {errors.confirmationCode}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Tickets URL
                  </label>
                  <input
                    type="url"
                    value={formState.ticketsUrl}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        ticketsUrl: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Notes
              </label>
              <textarea
                rows={3}
                value={formState.notes}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    notes: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <input
                type="checkbox"
                checked={formState.completed}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    completed: event.target.checked,
                  }))
                }
                className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              Marked done
            </label>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 shadow-sm btn-primary"
            >
              Save segment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDuration(startIso: string, endIso: string): string | null {
  if (!startIso || !endIso) return null;
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null;
  const totalMinutes = Math.round((end - start) / 60000);
  if (totalMinutes <= 0) return null;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}m`;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}
