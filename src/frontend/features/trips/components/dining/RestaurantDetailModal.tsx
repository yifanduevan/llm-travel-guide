"use client";

import type { DiningReservation } from "../TripWorkspace";
import type { Reservation } from "@/features/trips/mock";
import { formatDateTime, buildGoogleMapsSrc, formatPartySize } from "@/features/trips/utils/dining";

const GOOGLE_MAPS_EMBED_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;

type RestaurantDetailModalProps = {
  restaurant: DiningReservation;
  reservation: Reservation | null;
  onClose: () => void;
  googleMapsKey?: string;
};

export function RestaurantDetailModal({
  restaurant,
  reservation,
  onClose,
  googleMapsKey,
}: RestaurantDetailModalProps) {
  const mapsKey = googleMapsKey ?? GOOGLE_MAPS_EMBED_KEY;
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
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
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-slate-900">
              {restaurant.name}
            </h4>
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

        {/* Content */}
        <div className="px-6 py-5">
          <div className="space-y-6">
            {/* Restaurant Info Section */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Cuisine
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {restaurant.cuisine || "Cuisine TBD"}
                  </p>
                </div>
                <div className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                  <span>💵</span>
                  {restaurant.priceLevel
                    ? restaurant.priceLevel.toLowerCase()
                    : "price tbd"}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Address
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {restaurant.address || "Address pending"}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Reservation Time
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {formatDateTime(reservation?.datetimeLocal ?? restaurant.time ?? null)}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Party Size
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {formatPartySize(reservation?.partySize)}
                </p>
              </div>

              {restaurant.notes && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Notes
                  </p>
                  <div className="mt-2 rounded-xl bg-slate-100 p-3 text-sm text-slate-600">
                    {restaurant.notes}
                  </div>
                </div>
              )}

              {reservation?.confirmationCode && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Confirmation Code
                  </p>
                  <p className="mt-1 text-sm font-mono text-slate-900">
                    {reservation.confirmationCode}
                  </p>
                </div>
              )}
            </div>

            {/* Google Maps */}
            {restaurant.address && (
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Location
                </p>
                {mapsKey ? (
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <iframe
                      width="100%"
                      height="320"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen={true}
                      referrerPolicy="no-referrer-when-downgrade"
                      src={buildGoogleMapsSrc(restaurant, mapsKey)}
                    />
                  </div>
                ) : (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
                    Map unavailable
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
