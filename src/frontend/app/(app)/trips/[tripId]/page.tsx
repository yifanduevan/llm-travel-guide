import Link from "next/link";
import TripWorkspace from "@/features/trips/components/TripWorkspace";
import {
  Accommodation,
  DiningReservation,
  TransportSegment,
} from "@/features/trips/components/TripWorkspace";

type TripDetailPageProps = {
  params: Promise<{ tripId: string }>;
};

type TripDto = {
  id: string;
  titleOrDestination: string;
  startDate: string | null;
  endDate: string | null;
};

async function fetchTrip(tripId: string): Promise<TripDto | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  try {
    const res = await fetch(`${baseUrl}/api/trips/${tripId}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as TripDto;
  } catch {
    return null;
  }
}

async function fetchSegments(tripId: string): Promise<TransportSegment[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  try {
    const res = await fetch(
      `${baseUrl}/api/trips/${tripId}/transport-segments`,
      {
        cache: "no-store",
      },
    );
    if (!res.ok) return [];
    return (await res.json()) as TransportSegment[];
  } catch {
    return [];
  }
}

async function fetchReservations(tripId: string): Promise<DiningReservation[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  try {
    const res = await fetch(
      `${baseUrl}/api/trips/${tripId}/dining-reservations`,
      {
        cache: "no-store",
      },
    );
    if (!res.ok) return [];
    return (await res.json()) as DiningReservation[];
  } catch {
    return [];
  }
}
async function fetchAccommodations(tripId: string): Promise<Accommodation[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  try {
    const res = await fetch(
      `${baseUrl}/api/trips/${tripId}/accommodations`,
      {
        cache: "no-store",
      },
    );
    if (!res.ok) return [];
    return (await res.json()) as Accommodation[];
  } catch {
    return [];
  }
}

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const { tripId } = await params;
  const [trip, transportSegments, diningReservations, accommodations] =
    await Promise.all([
      fetchTrip(tripId),
      fetchSegments(tripId),
      fetchReservations(tripId),
      fetchAccommodations(tripId),
    ]);

  return (
    <div className="space-y-6">
      <TripWorkspace
        tripId={tripId}
        trip={trip ?? undefined}
        transportSegments={transportSegments}
        diningReservations={diningReservations}
        accommodations={accommodations}
      />

      <div className="flex gap-3">
        <Link
          href={`/trips/${tripId}/edit`}
          className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800"
        >
          Edit trip
        </Link>
        <Link
          href="/trips"
          className="rounded-lg border border-slate-200 px-4 py-2 text-slate-800 transition hover:border-slate-300 hover:bg-white"
        >
          Back to trips
        </Link>
      </div>
    </div>
  );
}
