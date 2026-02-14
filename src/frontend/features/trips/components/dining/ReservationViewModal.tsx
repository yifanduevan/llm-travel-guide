"use client";

import type { DiningReservation } from "../TripWorkspace";
import type { Reservation } from "@/features/trips/mock";
import { formatReservedTime } from "@/features/trips/utils/dining";

type ReservationViewModalProps = {
  restaurant: DiningReservation;
  reservation: Reservation;
  onClose: () => void;
  onEdit: () => void;
};

export function ReservationViewModal({
  restaurant,
  reservation,
  onClose,
  onEdit,
}: ReservationViewModalProps) {
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
                Reservation Summary
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
          <div className="space-y-4 text-sm text-slate-700">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Name
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {reservation?.name || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Guests
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {reservation?.partySize ?? "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Date & Time
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {reservation
                  ? formatReservedTime(reservation.datetimeLocal)
                  : "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Confirmation Code
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {reservation?.confirmationCode || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Notes
              </p>
              <p className="mt-1 text-slate-700">
                {reservation?.notes || "No notes"}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={onEdit}
                className="rounded-xl px-4 py-2 text-xs font-bold btn-primary"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
