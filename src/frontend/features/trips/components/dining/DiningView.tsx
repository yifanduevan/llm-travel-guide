"use client";

import { useMemo, useState } from "react";
import type { DiningReservation } from "../TripWorkspace";
import type { Reservation } from "@/features/trips/mock";
import { useRestaurants } from "@/features/trips/hooks/useRestaurants";
import { useReservations } from "@/features/trips/hooks/useReservations";
import { RestaurantCard } from "./RestaurantCard";
import { RestaurantDetailModal } from "./RestaurantDetailModal";
import { ReservationModal } from "./ReservationModal";
import { ReservationViewModal } from "./ReservationViewModal";
import { AddRestaurantModal } from "./AddRestaurantModal";
import { getRestaurantKey, toDateTimeLocal } from "@/features/trips/utils/dining";
import ConfirmOverlay from "../ConfirmOverlay";
import {
  DiningReservationEditModal,
  type DiningReservationEditForm,
} from "./DiningReservationEditModal";

type ModalState =
  | { type: "none" }
  | { type: "addRestaurant" }
  | { type: "restaurantDetail"; restaurantId: string }
  | { type: "addReservation"; restaurantId: string }
  | { type: "viewReservation"; restaurantId: string };

type DiningViewProps = {
  tripId: string;
  tripStartDate?: string | null;
  editable?: boolean;
};

export function DiningView({
  tripId,
  tripStartDate,
  editable = false,
}: DiningViewProps) {
  const {
    restaurants: apiRestaurants,
    loading,
    error: restaurantError,
  } = useRestaurants(tripId);
  const { getReservation, upsertReservation, removeReservation } =
    useReservations(tripId, apiRestaurants);

  const [userAddedRestaurants, setUserAddedRestaurants] = useState<
    DiningReservation[]
  >([]);
  const [editedRestaurantsById, setEditedRestaurantsById] = useState<
    Record<string, DiningReservation>
  >({});
  const [removedRestaurantIds, setRemovedRestaurantIds] = useState<
    Record<string, true>
  >({});
  const [modalState, setModalState] = useState<ModalState>({ type: "none" });
  const [apiError, setApiError] = useState<string | null>(null);
  const [editingRestaurantId, setEditingRestaurantId] = useState<string | null>(
    null,
  );
  const [editForm, setEditForm] = useState<DiningReservationEditForm | null>(
    null,
  );
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    restaurantId: string;
    restaurantName: string;
  } | null>(null);

  // Merge API restaurants with user-added ones
  const allRestaurants = useMemo(() => {
    const merged = [...apiRestaurants, ...userAddedRestaurants];

    return merged
      .filter((restaurant) => !removedRestaurantIds[restaurant.id])
      .map((restaurant) => editedRestaurantsById[restaurant.id] ?? restaurant);
  }, [apiRestaurants, userAddedRestaurants, removedRestaurantIds, editedRestaurantsById]);

  const openDetailModal = (restaurantId: string) => {
    setModalState({ type: "restaurantDetail", restaurantId });
  };

  const openAddReservationModal = (restaurantId: string) => {
    setModalState({ type: "addReservation", restaurantId });
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
      if (modalState.type !== "addReservation") {
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
    openAddReservationModal(restaurant.id);
  };

  const handleCardViewReservation = (restaurant: DiningReservation) => {
    openViewReservationModal(restaurant.id);
  };

  const closeEditDiningCardModal = () => {
    setEditingRestaurantId(null);
    setEditForm(null);
    setEditFormError(null);
  };

  const openEditDiningCardModal = (
    restaurant: DiningReservation,
    reservation: Reservation | null,
  ) => {
    setEditingRestaurantId(restaurant.id);
    setEditFormError(null);
    setEditForm({
      name: restaurant.name,
      address: restaurant.address ?? "",
      cuisine: restaurant.cuisine ?? "",
      priceLevel: restaurant.priceLevel ?? "MEDIUM",
      notes: restaurant.notes ?? "",
      reservationName: reservation?.name ?? restaurant.name,
      reservationPartySize:
        reservation?.partySize ?? restaurant.partySize ?? 2,
      reservationTime:
        reservation?.datetimeLocal ?? toDateTimeLocal(restaurant.time ?? ""),
      reservationCode:
        reservation?.confirmationCode ?? restaurant.confirmationCode ?? "",
      reservationNotes: reservation?.notes ?? restaurant.notes ?? "",
    });
  };

  const handleSaveEditedDiningCard = () => {
    if (!editingRestaurantId || !editForm) return;

    const trimmedRestaurantName = editForm.name.trim();
    if (!trimmedRestaurantName) {
      setEditFormError("Restaurant name is required.");
      return;
    }

    if (
      !Number.isFinite(editForm.reservationPartySize) ||
      editForm.reservationPartySize < 1
    ) {
      setEditFormError("Guest count must be at least 1.");
      return;
    }

    const restaurant = allRestaurants.find((item) => item.id === editingRestaurantId);
    if (!restaurant) {
      setEditFormError("Unable to find that reservation card.");
      return;
    }

    const sanitizedPartySize = Math.max(1, Math.round(editForm.reservationPartySize));
    const nextRestaurant: DiningReservation = {
      ...restaurant,
      name: trimmedRestaurantName,
      address: editForm.address.trim() || null,
      cuisine: editForm.cuisine.trim() || null,
      priceLevel: editForm.priceLevel,
      notes: editForm.notes.trim() || null,
      time: editForm.reservationTime || null,
      confirmationCode: editForm.reservationCode.trim() || null,
      partySize: sanitizedPartySize,
    };

    setEditedRestaurantsById((prev) => ({
      ...prev,
      [nextRestaurant.id]: nextRestaurant,
    }));

    const restaurantKey = getRestaurantKey(nextRestaurant);
    upsertReservation(restaurantKey, {
      restaurantId: restaurantKey,
      name: editForm.reservationName.trim() || trimmedRestaurantName,
      partySize: sanitizedPartySize,
      datetimeLocal: editForm.reservationTime,
      confirmationCode: editForm.reservationCode.trim(),
      notes: editForm.reservationNotes.trim(),
    });

    closeEditDiningCardModal();
  };

  const handleConfirmDeleteReservation = () => {
    if (!deleteTarget) return;

    const restaurant = allRestaurants.find(
      (item) => item.id === deleteTarget.restaurantId,
    );
    if (!restaurant) {
      setDeleteTarget(null);
      return;
    }

    const restaurantKey = getRestaurantKey(restaurant);
    removeReservation(restaurantKey);

    setUserAddedRestaurants((prev) =>
      prev.filter((item) => item.id !== restaurant.id),
    );

    setEditedRestaurantsById((prev) => {
      if (!(restaurant.id in prev)) {
        return prev;
      }

      const next = { ...prev };
      delete next[restaurant.id];
      return next;
    });

    setRemovedRestaurantIds((prev) => ({
      ...prev,
      [restaurant.id]: true,
    }));

    if (editingRestaurantId === restaurant.id) {
      closeEditDiningCardModal();
    }

    setModalState((prev) => {
      if ("restaurantId" in prev && prev.restaurantId === restaurant.id) {
        return { type: "none" };
      }

      return prev;
    });

    setDeleteTarget(null);
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
                editable={editable}
                onOpenDetail={() => openDetailModal(restaurant.id)}
                onViewReservation={handleCardViewReservation}
                onAddReservation={handleCardAddReservation}
                onEditCard={openEditDiningCardModal}
                onDeleteReservation={(targetRestaurant) =>
                  setDeleteTarget({
                    restaurantId: targetRestaurant.id,
                    restaurantName: targetRestaurant.name,
                  })
                }
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

      {/* Reservation Modal (Add) */}
      {modalState.type === "addReservation" && currentRestaurant && (
        <ReservationModal
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
          />
        )}

      {/* Quick Edit Dining Card Modal */}
      {editingRestaurantId && editForm && (
        <DiningReservationEditModal
          open={true}
          form={editForm}
          formError={editFormError}
          tripStartDate={tripStartDate}
          onFormChange={(nextForm) => setEditForm(nextForm)}
          onClose={closeEditDiningCardModal}
          onSave={handleSaveEditedDiningCard}
        />
      )}

      <ConfirmOverlay
        open={!!deleteTarget}
        title="Delete reservation?"
        message={
          deleteTarget
            ? `Delete the reservation for "${deleteTarget.restaurantName}" from this trip? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Keep"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDeleteReservation}
      />

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
