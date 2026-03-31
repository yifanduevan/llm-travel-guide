import { Suspense } from "react";
import TripEditor from "./trip-editor";
import { API_BASE_URL } from "@/lib/apiClient";

type EditTripPageProps = {
  params: Promise<{ tripId: string }>;
};

type TripDto = {
  id: string;
  titleOrDestination: string;
  startDate: string | null;
  endDate: string | null;
};

import {
  Accommodation,
  TransportSegment,
} from "@/features/trips/components/TripWorkspace";

async function fetchTrip(tripId: string): Promise<TripDto | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/trips/${tripId}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as TripDto;
  } catch (e) {
    console.error("Failed to fetch trip", e);
    return null;
  }
}

async function fetchSegments(tripId: string): Promise<TransportSegment[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/trips/${tripId}/transport-segments`,
      {
        cache: "no-store",
      },
    );
    if (!res.ok) {
      return [];
    }
    return (await res.json()) as TransportSegment[];
  } catch (e) {
    console.error("Failed to fetch segments", e);
    return [];
  }
}
async function fetchAccommodations(tripId: string): Promise<Accommodation[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/trips/${tripId}/accommodations`,
      {
        cache: "no-store",
      },
    );
    if (!res.ok) {
      return [];
    }
    return (await res.json()) as Accommodation[];
  } catch (e) {
    console.error("Failed to fetch accommodations", e);
    return [];
  }
}

export default async function EditTripPage({ params }: EditTripPageProps) {
  const { tripId } = await params;
  const [trip, transportSegments, accommodations] = await Promise.all([
    fetchTrip(tripId),
    fetchSegments(tripId),
    fetchAccommodations(tripId),
  ]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TripEditor
        tripId={tripId}
        trip={trip ?? undefined}
        transportSegments={transportSegments}
        accommodations={accommodations}
      />
    </Suspense>
  );
}