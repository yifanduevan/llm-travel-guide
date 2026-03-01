"use client";

import { useState } from "react";
import type { DiningReservation } from "../TripWorkspace";
import type { Reservation } from "@/features/trips/mock";
import { useRestaurants } from "@/features/trips/hooks/useRestaurants";
import { useReservations } from "@/features/trips/hooks/useReservations";
import { RestaurantCard } from "./RestaurantCard";
import { RestaurantDetailModal } from "./RestaurantDetailModal";
import { ReservationModal } from "./ReservationModal";
import { ReservationViewModal } from "./ReservationViewModal";
import { AddRestaurantModal } from "./AddRestaurantModal";
import { getRestaurantKey } from "@/features/trips/utils/dining";

type ModalState =
  | { type: "none" }
  | { type: "addRestaurant" }
  | { type: "restaurantDetail"; restaurantId: string }
  | { type: "reservation"; mode: "add" | "edit"; restaurantId: string }
  | { type: "viewReservation"; restaurantId: string };

type DiningViewProps = {
  tripId: string;
  tripStartDate?: string | null;
};

export function DiningView({ tripId, tripStartDate }: DiningViewProps) {
  const {
    restaurants: apiRestaurants,
    loading,
    error: restaurantError,
  } = useRestaurants(tripId);
  const { getReservation, upsertReservation } =
    useReservations(tripId, apiRestaurants);

  const [userAddedRestaurants, setUserAddedRestaurants] = useState<
    DiningReservation[]
  >([]);
  const [modalState, setModalState] = useState<ModalState>({ type: "none" });
  const [apiError, setApiError] = useState<string | null>(null);

  // Merge API restaurants with user-added ones
  const allRestaurants = [...apiRestaurants, ...userAddedRestaurants];

  const openDetailModal = (restaurantId: string) => {
    setModalState({ type: "restaurantDetail", restaurantId });
  };

  const openReservationModal = (restaurantId: string, mode: "add" | "edit") => {
    setModalState({ type: "reservation", mode, restaurantId });
  };

  const openViewReservationModal = (restaurantId: string) => {
    setModalState({ type: "viewReservation", restaurantId });
  };

  const openAddRestaurantModal = () => {
    setModalState({ type: "addRestaurant" });
  };

  const closeModal = () => {
    setModalState({ type: "none" });
  };

  const handleSaveReservation = async (reservation: Reservation) => {
    try {
      setApiError(null);
      if (modalState.type !== "reservation") {
        throw new Error("Invalid modal state for saving a reservation.");
      }

      const restaurant = allRestaurants.find(
        (r) => r.id === modalState.restaurantId
      );

      if (!restaurant) {
        throw new Error("Restaurant not found for the given reservation.");
      }

      const restaurantKey = getRestaurantKey(restaurant);
      upsertReservation(restaurantKey, reservation);
      closeModal();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save reservation";
      setApiError(message);
    }
  };

  const handleAddRestaurant = (
    restaurant: DiningReservation,
    reservation?: Reservation
  ) => {
    setUserAddedRestaurants((prev) => [...prev, restaurant]);

    if (reservation) {
      const restaurantKey = getRestaurantKey(restaurant);
      upsertReservation(restaurantKey, reservation);
    }

    closeModal();
  };

  const getRestaurantById = (id: string) => {
    return allRestaurants.find((r) => r.id === id);
  };

  const handleCardAddReservation = (restaurant: DiningReservation) => {
    openReservationModal(restaurant.id, "add");
  };

  const handleCardEditReservation = (restaurant: DiningReservation) => {
    openReservationModal(restaurant.id, "edit");
  };

  const handleCardViewReservation = (restaurant: DiningReservation) => {
    openViewReservationModal(restaurant.id);
  };

  // Render error state
  if (restaurantError && !loading) {
    return (
      <div className="space-y-4 py-8">
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <p className="font-semibold">Couldn&apos;t load dining options</p>
          <p className="mt-1">{restaurantError}</p>
        </div>
      </div>
    );
  }

  // Render loading state
  if (loading) {
    return (
      <div className="space-y-4 py-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>
      </div>
    );
  }

  // Get current modal's restaurant
  const currentRestaurant =
    modalState.type !== "none" && modalState.type !== "addRestaurant"
      ? getRestaurantById(modalState.restaurantId)
      : null;

  const currentReservation = currentRestaurant
    ? getReservation(getRestaurantKey(currentRestaurant))
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-3xl font-semibold text-slate-900">Gastronomy</h3>
          <p className="mt-1 text-sm text-slate-500">
            Organize and manage your dining reservations for this trip.
          </p>
        </div>
        <button
          onClick={openAddRestaurantModal}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 shadow-sm btn-primary"
        >
          <span className="material-symbols-outlined mr-1 inline-block">
            restaurant
          </span>
          Add restaurant
        </button>
      </div>

      {/* API Error */}
      {apiError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {apiError}
        </div>
      )}

      {/* Empty State */}
      {allRestaurants.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 py-12 text-center">
          <span className="material-symbols-outlined mx-auto mb-3 block text-4xl text-slate-400">
            restaurant
          </span>
          <p className="text-sm font-semibold text-slate-900">
            No restaurants yet
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Add your first restaurant to get started
          </p>
        </div>
      )}

      {/* Restaurant Grid */}
      {allRestaurants.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {allRestaurants.map((restaurant) => {
            const restaurantKey = getRestaurantKey(restaurant);
            const reservation = getReservation(restaurantKey);

            return (
              <RestaurantCard
                key={`${restaurant.id}-${restaurant.name}`}
                restaurant={restaurant}
                reservation={reservation}
                onOpenDetail={() => openDetailModal(restaurant.id)}
                onViewReservation={handleCardViewReservation}
                onEditReservation={handleCardEditReservation}
                onAddReservation={handleCardAddReservation}
              />
            );
          })}
        </div>
      )}

      {/* Restaurant Detail Modal */}
      {modalState.type === "restaurantDetail" && currentRestaurant && (
        <RestaurantDetailModal
          restaurant={currentRestaurant}
          reservation={currentReservation ?? null}
          onClose={closeModal}
        />
      )}

      {/* Reservation Modal (Add/Edit) */}
      {modalState.type === "reservation" && currentRestaurant && (
        <ReservationModal
          mode={modalState.mode}
          restaurant={currentRestaurant}
          initialReservation={currentReservation ?? null}
          tripStartDate={tripStartDate}
          onSave={handleSaveReservation}
          onClose={closeModal}
        />
      )}

      {/* Reservation View Modal */}
      {modalState.type === "viewReservation" &&
        currentRestaurant &&
        currentReservation && (
          <ReservationViewModal
            restaurant={currentRestaurant}
            reservation={currentReservation}
            onClose={closeModal}
            onEdit={() => handleCardEditReservation(currentRestaurant)}
          />
        )}

      {/* Add Restaurant Modal */}
      {modalState.type === "addRestaurant" && (
        <AddRestaurantModal
          tripId={tripId}
          tripStartDate={tripStartDate}
          onSave={handleAddRestaurant}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
