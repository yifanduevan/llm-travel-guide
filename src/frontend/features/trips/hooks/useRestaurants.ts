import { useEffect, useState } from "react";
import { getDiningReservations } from "@/features/trips/api";
import type { DiningReservation } from "../components/TripWorkspace";
import type { DiningReservationDto } from "@/lib/types";
import { slugify } from "@/features/trips/utils/dining";

function mapDiningReservationDto(
  apiRes: DiningReservationDto,
  tripId: string,
  index: number
): DiningReservation {
  const name = apiRes.name ?? "Untitled restaurant";
  const address = apiRes.address ?? "";
  const time = apiRes.time ?? "";
  const baseId = apiRes.id ?? slugify(`${name}-${address}-${time}-${index}`);
  const scopedId = `${tripId}-${baseId}`;

  return {
    id: scopedId,
    name,
    time: apiRes.time ?? null,
    cuisine: apiRes.cuisine ?? null,
    priceTier: apiRes.priceTier ?? null,
    status: apiRes.status ?? "pending",
    address: apiRes.address ?? null,
    notes: apiRes.notes ?? null,
    confirmationCode: apiRes.confirmationCode ?? null,
    partySize: apiRes.partySize ?? null,
    imageUrl: apiRes.imageUrl ?? null,
  };
}

type UseRestaurantsResult = {
  restaurants: DiningReservation[];
  loading: boolean;
  error: string | null;
};

export function useRestaurants(tripId: string): UseRestaurantsResult {
  const [restaurants, setRestaurants] = useState<DiningReservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadRestaurants = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getDiningReservations(tripId);
        if (!active) return;
        setRestaurants(
          data.map((item, index) => mapDiningReservationDto(item, tripId, index))
        );
      } catch {
        if (!active) return;
        setRestaurants([]);
        setError("Unable to load dining reservations.");
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };

    void loadRestaurants();

    return () => {
      active = false;
    };
  }, [tripId]);

  return { restaurants, loading, error };
}
