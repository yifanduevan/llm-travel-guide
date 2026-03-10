"use client";

import type { PriceLevel } from "@/features/trips/utils/diningPrice";
import { DateTimePicker } from "../DateTimePicker";
import OverlayModal from "../OverlayModal";

export type DiningReservationEditForm = {
  name: string;
  address: string;
  cuisine: string;
  priceLevel: PriceLevel;
  notes: string;
  reservationName: string;
  reservationPartySize: number;
  reservationTime: string;
  reservationCode: string;
  reservationNotes: string;
};

type DiningReservationEditModalProps = {
  open: boolean;
  tripStartDate?: string | null;
  form: DiningReservationEditForm;
  formError?: string | null;
  onFormChange: (nextForm: DiningReservationEditForm) => void;
  onClose: () => void;
  onSave: () => void;
};

export function DiningReservationEditModal({
  open,
  tripStartDate,
  form,
  formError,
  onFormChange,
  onClose,
  onSave,
}: DiningReservationEditModalProps) {
  return (
    <OverlayModal
      open={open}
      onClose={onClose}
      title="Edit dining reservation"
      description="Update restaurant and reservation details for this card."
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold btn-primary"
            onClick={onSave}
          >
            Save
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {formError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {formError}
          </div>
        )}

        <section className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-900">Restaurant</h4>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Restaurant name
            </span>
            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  name: event.target.value,
                })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Address
            </span>
            <input
              type="text"
              value={form.address}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  address: event.target.value,
                })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Cuisine
              </span>
              <input
                type="text"
                value={form.cuisine}
                onChange={(event) =>
                  onFormChange({
                    ...form,
                    cuisine: event.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Price level
              </span>
              <div className="inline-flex w-full items-center rounded-lg border border-slate-200 bg-white p-1">
                {(["LOW", "MEDIUM", "HIGH"] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() =>
                      onFormChange({
                        ...form,
                        priceLevel: level,
                      })
                    }
                    className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold uppercase transition ${
                      form.priceLevel === level
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {level.toLowerCase()}
                  </button>
                ))}
              </div>
            </label>
          </div>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Notes / description
            </span>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  notes: event.target.value,
                })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
            />
          </label>
        </section>

        <section className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-900">Reservation</h4>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Name
            </span>
            <input
              type="text"
              value={form.reservationName}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  reservationName: event.target.value,
                })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Guest count
              </span>
              <input
                type="number"
                min={1}
                value={form.reservationPartySize}
                onChange={(event) =>
                  onFormChange({
                    ...form,
                    reservationPartySize: Number(event.target.value),
                  })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Confirmation number
              </span>
              <input
                type="text"
                value={form.reservationCode}
                onChange={(event) =>
                  onFormChange({
                    ...form,
                    reservationCode: event.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </label>
          </div>

          <div className="space-y-2 text-sm text-slate-700">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Reservation date/time
            </span>
            <DateTimePicker
              value={form.reservationTime}
              onChange={(nextValue) =>
                onFormChange({
                  ...form,
                  reservationTime: nextValue,
                })
              }
              tripStartDate={tripStartDate}
            />
          </div>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Notes / description
            </span>
            <textarea
              rows={3}
              value={form.reservationNotes}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  reservationNotes: event.target.value,
                })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
            />
          </label>
        </section>
      </div>
    </OverlayModal>
  );
}
