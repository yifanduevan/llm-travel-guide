"use client";

import { useState } from "react";
import type { DiningReservation } from "../TripWorkspace";
import type { Reservation } from "@/features/trips/mock";
import { DateTimePicker } from "../DateTimePicker";
import { validateAddRestaurant, validateReservation } from "@/features/trips/utils/dining";

type AddRestaurantFormState = {
  // Restaurant fields
  name: string;
  address: string;
  cuisine: string;
  priceTier: string;
  imageUrl: string;
  notes: string;
  // Reservation fields (optional)
  addReservation: boolean;
  reservationName: string;
  reservationPartySize: number;
  reservationTime: string;
  reservationCode: string;
  reservationNotes: string;
};

type FormErrors = Partial<Record<keyof AddRestaurantFormState, string>>;

type AddRestaurantModalProps = {
  tripId: string;
  tripStartDate?: string | null;
  onSave: (restaurant: DiningReservation, reservation?: Reservation) => void;
  onClose: () => void;
};

export function AddRestaurantModal({
  tripId,
  tripStartDate,
  onSave,
  onClose,
}: AddRestaurantModalProps) {
  const [formState, setFormState] = useState<AddRestaurantFormState>({
    name: "",
    address: "",
    cuisine: "",
    priceTier: "$",
    imageUrl: "",
    notes: "",
    addReservation: false,
    reservationName: "",
    reservationPartySize: 2,
    reservationTime: "",
    reservationCode: "",
    reservationNotes: "",
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const handleSave = () => {
    const errors = validateAddRestaurant(formState);

    if (formState.addReservation) {
      const reservationData = {
        restaurantId: "",
        name: formState.reservationName,
        partySize: formState.reservationPartySize,
        datetimeLocal: formState.reservationTime,
        confirmationCode: formState.reservationCode,
        notes: formState.reservationNotes,
      };
      const reservationErrors = validateReservation(reservationData);
      Object.assign(errors, reservationErrors);
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Create new restaurant
    const restaurantId = `${tripId}-${Date.now()}`;
    const newRestaurant: DiningReservation = {
      id: restaurantId,
      name: formState.name,
      address: formState.address,
      cuisine: formState.cuisine,
      priceTier: formState.priceTier,
      imageUrl: formState.imageUrl,
      notes: formState.notes,
      time: null,
      status: "upcoming",
      confirmationCode: null,
      partySize: null,
    };

    // Create optional reservation
    let reservation: Reservation | undefined;
    if (formState.addReservation) {
      reservation = {
        restaurantId,
        name: formState.reservationName,
        partySize: formState.reservationPartySize,
        datetimeLocal: formState.reservationTime,
        confirmationCode: formState.reservationCode,
        notes: formState.reservationNotes,
      };
    }

    onSave(newRestaurant, reservation);
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
                Add restaurant
              </p>
              <h4 className="mt-1 text-lg font-semibold text-slate-900">
                New restaurant
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
          <div className="space-y-6">
            {/* Restaurant Info Section */}
            <div>
              <h5 className="mb-4 text-sm font-semibold text-slate-900">
                Restaurant information
              </h5>
              <div className="grid gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Name <span className="text-rose-600">*</span>
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
                    <p className="mt-1 text-xs text-rose-600">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formState.address}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        address: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Cuisine
                  </label>
                  <input
                    type="text"
                    value={formState.cuisine}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        cuisine: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Price level
                    </label>
                    <select
                      value={formState.priceTier}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          priceTier: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    >
                      <option value="$">$ (Budget)</option>
                      <option value="$$">$$ (Moderate)</option>
                      <option value="$$$">$$$ (Upscale)</option>
                      <option value="$$$$">$$$$ (Fine dining)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={formState.imageUrl}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          imageUrl: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    />
                  </div>
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
            </div>

            {/* Reservation Section */}
            <div>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={formState.addReservation}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      addReservation: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-slate-900"
                />
                <span className="text-sm font-semibold text-slate-900">
                  Add reservation
                </span>
              </label>

              {formState.addReservation && (
                <div className="mt-4 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Diner name
                    </label>
                    <input
                      type="text"
                      value={formState.reservationName}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          reservationName: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    />
                    {formErrors.reservationName && (
                      <p className="mt-1 text-xs text-rose-600">
                        {formErrors.reservationName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Party size
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formState.reservationPartySize}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          reservationPartySize: Number(event.target.value),
                        }))
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    />
                    {formErrors.reservationPartySize && (
                      <p className="mt-1 text-xs text-rose-600">
                        {formErrors.reservationPartySize}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Reserved time
                    </label>
                    <DateTimePicker
                      value={formState.reservationTime}
                      onChange={(dateStr) =>
                        setFormState((prev) => ({
                          ...prev,
                          reservationTime: dateStr,
                        }))
                      }
                      tripStartDate={tripStartDate}
                    />
                    {formErrors.reservationTime && (
                      <p className="mt-1 text-xs text-rose-600">
                        {formErrors.reservationTime}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Confirmation code
                    </label>
                    <input
                      type="text"
                      value={formState.reservationCode}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          reservationCode: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Notes
                    </label>
                    <textarea
                      rows={2}
                      value={formState.reservationNotes}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          reservationNotes: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    />
                  </div>
                </div>
              )}
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
              Save restaurant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
