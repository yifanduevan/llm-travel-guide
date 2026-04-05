"use client";

import type { DiningReservation } from "../TripWorkspace";
import type { Reservation } from "@/features/trips/mock";
import { normalizeStatus, formatDateTime, formatPartySize } from "@/features/trips/utils/dining";

type RestaurantCardProps = {
  restaurant: DiningReservation;
  reservation: Reservation | null;
  editable: boolean;
  onOpenDetail: (restaurantId: string) => void;
  onViewReservation: (restaurant: DiningReservation, reservation: Reservation) => void;
  onAddReservation: (restaurant: DiningReservation) => void;
  onEditCard: (restaurant: DiningReservation, reservation: Reservation | null) => void;
  onDeleteReservation: (restaurant: DiningReservation) => void;
};

export function RestaurantCard({
  restaurant,
  reservation,
  editable,
  onOpenDetail,
  onViewReservation,
  onAddReservation,
  onEditCard,
  onDeleteReservation,
}: RestaurantCardProps) {
  const statusLabel = normalizeStatus(restaurant.status).toUpperCase();
  const notesValue = reservation?.notes ?? restaurant.notes ?? "No notes";
  const confirmationValue =
    reservation?.confirmationCode ?? restaurant.confirmationCode ?? "—";
  const timeValue = reservation?.datetimeLocal ?? restaurant.time ?? null;
  const priceLabel = restaurant.priceLevel
    ? restaurant.priceLevel.toLowerCase()
    : "price tbd";

  return (
    <div
      onClick={() => onOpenDetail(restaurant.id)}
      className="group cursor-pointer rounded-2xl border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.08)] transition-all duration-250 hover:shadow-[0_20px_40px_rgba(15,23,42,0.16)] hover:-translate-y-1"
    >
      <div className="relative overflow-hidden rounded-t-2xl">
        {restaurant.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            width={500}
            height={240}
            className="h-60 w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            decoding="async"
          />
        ) : (
          <div className="flex h-60 w-full items-center justify-center bg-slate-100 text-slate-400 transition-transform duration-300 group-hover:scale-105">
            <span className="material-symbols-outlined text-4xl">restaurant</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/25 to-transparent" />
        <span className="absolute right-4 top-4 rounded-full bg-[#111827] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
          {statusLabel}
        </span>
      </div>

      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[22px] font-semibold text-slate-900">
              {restaurant.name}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {restaurant.address || "Address pending"}
            </p>
          </div>
          <div className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 leading-none shrink-0">
            <span>💵</span>
            {priceLabel}
          </div>
        </div>

        <div className="grid gap-2 text-sm text-slate-600">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-base text-slate-500">schedule</span>
            <span>{formatDateTime(timeValue)}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-base text-slate-500">
              restaurant_menu
            </span>
            <span>{restaurant.cuisine || "Cuisine TBD"}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-base text-slate-500">group</span>
            <span>{formatPartySize(reservation?.partySize)}</span>
          </div>
        </div>

        <div className="rounded-xl bg-slate-100 p-4 text-sm text-slate-600">
          {notesValue}
        </div>

        {restaurant.address && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              [restaurant.name, restaurant.address].filter(Boolean).join(", ")
            )}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-sm">location_on</span>
            Open in Google Maps
          </a>
        )}

        <div className="text-sm text-slate-600">
          Confirmation: {confirmationValue}
        </div>

        <div className="flex items-center justify-between gap-3">
          {editable ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditCard(restaurant, reservation);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                title="Edit reservation"
                aria-label="Edit reservation"
              >
                <span className="material-symbols-outlined text-base leading-none">
                  edit
                </span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteReservation(restaurant);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full text-red-600 transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
                title="Delete reservation"
                aria-label="Delete reservation"
              >
                <span className="material-symbols-outlined text-base leading-none">
                  delete
                </span>
              </button>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center justify-end gap-2">
            {reservation ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewReservation(restaurant, reservation);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                View reservation
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddReservation(restaurant);
                }}
                className="rounded-xl px-4 py-2 text-xs font-bold btn-primary"
              >
                Add reservation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
