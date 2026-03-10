import { useEffect, useRef, useState } from "react";
import {
  getMockReservationByRestaurantId,
  mockReservations,
  type Reservation,
} from "@/features/trips/mock";
import { apiGet, apiPost, apiPut } from "@/lib/apiClient";
import type { DiningReservationDto } from "@/lib/types";
import type { DiningReservation } from "../components/TripWorkspace";
import { getRestaurantKey } from "../utils/dining";
import { toBackendPriceTier } from "@/features/trips/utils/diningPrice";

type UseReservationsResult = {
  reservations: Record<string, Reservation | null>;
  getReservation: (restaurantKey: string) => Reservation | null;
  upsertReservation: (restaurantKey: string, reservation: Reservation) => void;
  removeReservation: (restaurantKey: string) => void;
};

export function useReservations(
  tripId: string,
  restaurants: DiningReservation[]
): UseReservationsResult {
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";
  const [reservations, setReservations] = useState<Record<string, Reservation | null>>({});
  const tripIdRef = useRef(tripId);
  const reservationIdByKeyRef = useRef<Record<string, string>>({});

  const toReservation = (
    dto: DiningReservationDto,
    restaurantKey: string
  ): Reservation => ({
    restaurantId: restaurantKey,
    name: dto.name ?? "",
    partySize: dto.partySize ?? 1,
    datetimeLocal: dto.time ?? "",
    confirmationCode: dto.confirmationCode ?? "",
    notes: dto.notes ?? "",
  });

  const getBackendReservationIdFromRestaurantKey = (
    restaurantKey: string,
    currentTripId: string
  ): string | null => {
    const prefix = `${currentTripId}-`;
    if (!restaurantKey.startsWith(prefix)) return null;
    const id = restaurantKey.slice(prefix.length).trim();
    return id.length > 0 ? id : null;
  };

  const buildBackendPayload = (
    restaurant: DiningReservation,
    reservation: Reservation
  ) => {
    const toOffsetDateTime = (value: string): string | undefined => {
      if (!value) return undefined;
      const dt = new Date(value);
      if (Number.isNaN(dt.getTime())) return undefined;
      return dt.toISOString();
    };

    return {
      name: reservation.name,
      time: toOffsetDateTime(reservation.datetimeLocal),
      cuisine: restaurant.cuisine ?? undefined,
      priceTier: toBackendPriceTier(restaurant.priceLevel),
      status: "CONFIRMED",
      address: restaurant.address ?? undefined,
      notes: reservation.notes || undefined,
      confirmationCode: reservation.confirmationCode || undefined,
      partySize: Number.isFinite(reservation.partySize)
        ? reservation.partySize
        : undefined,
      imageUrl: restaurant.imageUrl ?? undefined,
    };
  };

  useEffect(() => {
    let active = true;

    const fetchReservation = async (
      restaurantKey: string,
      dtoById?: Map<string, DiningReservationDto>
    ): Promise<Reservation | null> => {
      if (isMock) {
        return getMockReservationByRestaurantId(restaurantKey);
      }

      try {
        if (!dtoById) {
          return null;
        }

        const reservationId = reservationIdByKeyRef.current[restaurantKey]
          ?? getBackendReservationIdFromRestaurantKey(restaurantKey, tripId);

        if (!reservationId) {
          return null;
        }

        const dto = dtoById.get(reservationId);
        if (!dto) {
          return null;
        }

        if (dto.id) {
          reservationIdByKeyRef.current[restaurantKey] = dto.id;
        }

        return toReservation(dto, restaurantKey);
      } catch {
        return null;
      }
    };

    const loadReservations = async () => {
      if (tripIdRef.current !== tripId) {
        tripIdRef.current = tripId;
        reservationIdByKeyRef.current = {};
        if (!active) return;
        setReservations({});
      }

      if (restaurants.length === 0) {
        reservationIdByKeyRef.current = {};
        if (!active) return;
        setReservations({});
        return;
      }

      let dtoById: Map<string, DiningReservationDto> | undefined;
      if (!isMock) {
        try {
          const list = await apiGet<DiningReservationDto[]>(
            `/api/trips/${tripId}/dining-reservations`
          );
          dtoById = new Map(
            list
              .filter((item): item is DiningReservationDto & { id: string } =>
                typeof item.id === "string" && item.id.length > 0
              )
              .map((item) => [item.id, item])
          );
        } catch {
          dtoById = new Map<string, DiningReservationDto>();
        }
      }

      const results = await Promise.all(
        restaurants.map(async (restaurant) => {
          const restaurantKey = getRestaurantKey(restaurant);
          const data = await fetchReservation(restaurantKey, dtoById);
          return { restaurantKey, data };
        })
      );

      if (!active) return;

      const next: Record<string, Reservation | null> = {};
      for (const { restaurantKey, data } of results) {
        next[restaurantKey] = data ? { ...data } : null;
      }

      setReservations(next);
    };

    void loadReservations();

    return () => {
      active = false;
    };
  }, [restaurants, tripId, isMock]);

  const getReservation = (restaurantKey: string): Reservation | null => {
    return reservations[restaurantKey] ?? null;
  };

  const upsertReservation = (restaurantKey: string, reservation: Reservation) => {
    setReservations((prev) => ({
      ...prev,
      [restaurantKey]: reservation,
    }));

    if (isMock) {
      mockReservations[restaurantKey] = reservation;
      return;
    }

    const restaurant = restaurants.find(
      (item) => getRestaurantKey(item) === restaurantKey
    );
    if (!restaurant) {
      return;
    }

    const payload = buildBackendPayload(restaurant, reservation);
    const existingReservationId =
      reservationIdByKeyRef.current[restaurantKey]
      ?? getBackendReservationIdFromRestaurantKey(restaurantKey, tripId);

    void (async () => {
      try {
        const dto = existingReservationId
          ? await apiPut<DiningReservationDto>(
              `/api/trips/${tripId}/dining-reservations/${existingReservationId}`,
              payload
            )
          : await apiPost<DiningReservationDto>(
              `/api/trips/${tripId}/dining-reservations`,
              payload
            );

        if (dto.id) {
          reservationIdByKeyRef.current[restaurantKey] = dto.id;
        }

        setReservations((prev) => ({
          ...prev,
          [restaurantKey]: toReservation(dto, restaurantKey),
        }));
      } catch {
        // Backend endpoint may be unavailable; keep optimistic local state.
      }
    })();

  };

  const removeReservation = (restaurantKey: string) => {
    setReservations((prev) => ({
      ...prev,
      [restaurantKey]: null,
    }));

    if (isMock) {
      delete mockReservations[restaurantKey];
    }
  };

  return {
    reservations,
    getReservation,
    upsertReservation,
    removeReservation,
  };
}
