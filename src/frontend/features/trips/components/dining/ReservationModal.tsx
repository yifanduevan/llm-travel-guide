"use client";

import { useState } from "react";
import type { DiningReservation } from "../TripWorkspace";
import type { Reservation } from "@/features/trips/mock";
import { DateTimePicker } from "../DateTimePicker";
import { validateReservation } from "@/features/trips/utils/dining";

const emptyReservation: Reservation = {
  restaurantId: "",
  name: "",
  partySize: 2,
  datetimeLocal: "",
  confirmationCode: "",
  notes: "",
};

type ReservationModalProps = {
  restaurant: DiningReservation;
  initialReservation: Reservation | null;
  tripStartDate?: string | null;
  onSave: (reservation: Reservation) => void;
  onClose: () => void;
};

export function ReservationModal({
  restaurant,
  initialReservation,
  tripStartDate,
  onSave,
  onClose,
}: ReservationModalProps) {
  const [formState, setFormState] = useState<Reservation>(
    initialReservation ?? {
      ...emptyReservation,
      restaurantId: restaurant.id,
    },
  );
  const [formErrors, setFormErrors] = useState<
    Partial<Record<"name" | "partySize" | "datetimeLocal", string>>
  >({});

  const handleSave = () => {
    const errors = validateReservation(formState);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    onSave(formState);
    onClose();
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
                Add reservation
              </p>
              <h4 className="mt-1 text-lg font-semibold text-slate-900">
                {restaurant.name}
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
                Diner name
              </label>
              <input
                type="text"
                value={formState.name}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              />
              {formErrors.name && (
                <p className="mt-1 text-xs text-rose-600">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Party size
              </label>
              <input
                type="number"
                min={1}
                value={formState.partySize}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    partySize: Number(event.target.value),
                  }))
                }
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              />
              {formErrors.partySize && (
                <p className="mt-1 text-xs text-rose-600">{formErrors.partySize}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Reserved time
              </label>
              <DateTimePicker
                value={formState.datetimeLocal}
                onChange={(dateStr) =>
                  setFormState((prev) => ({
                    ...prev,
                    datetimeLocal: dateStr,
                  }))
                }
                tripStartDate={tripStartDate}
              />
              {formErrors.datetimeLocal && (
                <p className="mt-1 text-xs text-rose-600">
                  {formErrors.datetimeLocal}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Confirmation code
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
            </div>

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
              className="rounded-xl px-4 py-2 text-xs font-bold btn-primary"
            >
              Save reservation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
