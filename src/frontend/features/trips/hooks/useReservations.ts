import { useEffect, useRef, useState } from "react";
import {
  getMockReservationByRestaurantId,
  type Reservation,
} from "@/features/trips/mock";
import type { DiningReservation } from "../components/TripWorkspace";
import { getRestaurantKey } from "../utils/dining";

type UseReservationsResult = {
  reservations: Record<string, Reservation | null>;
  getReservation: (restaurantKey: string) => Reservation | null;
  upsertReservation: (restaurantKey: string, reservation: Reservation) => void;
};

export function useReservations(
  tripId: string,
  restaurants: DiningReservation[]
): UseReservationsResult {
  const [reservations, setReservations] = useState<Record<string, Reservation | null>>({});
  const tripIdRef = useRef(tripId);

  useEffect(() => {
    let active = true;

    const loadReservations = async () => {
      if (tripIdRef.current !== tripId) {
        tripIdRef.current = tripId;
        if (!active) return;
        setReservations({});
      }

      if (restaurants.length === 0) {
        return;
      }

      for (const restaurant of restaurants) {
        if (!active) return;
        const restaurantKey = getRestaurantKey(restaurant);
        try {
          const data = await getMockReservationByRestaurantId(restaurantKey);
          if (!active) return;
          if (data) {
            setReservations((prev) => {
              if (prev[restaurantKey]) return prev;
              return {
                ...prev,
                [restaurantKey]: { ...data },
              };
            });
          }
        } catch {
          if (!active) return;
        }
      }
    };

    void loadReservations();

    return () => {
      active = false;
    };
  }, [restaurants, tripId]);

  const getReservation = (restaurantKey: string): Reservation | null => {
    return reservations[restaurantKey] ?? null;
  };

  const upsertReservation = (restaurantKey: string, reservation: Reservation) => {
    setReservations((prev) => ({
      ...prev,
      [restaurantKey]: reservation,
    }));
  };

  return {
    reservations,
    getReservation,
    upsertReservation,
  };
}
