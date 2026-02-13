import Link from "next/link";
import { getTrips } from "@/features/trips/api";
import { TripDto } from "@/lib/types";

type LocalTripDto = {
  id: string;
  titleOrDestination: string;
  startDate: string | null;
  endDate: string | null;
};

function mapTripDto(apiTrip: TripDto): LocalTripDto {
  return {
    id: apiTrip.id || '',
    titleOrDestination: apiTrip.titleOrDestination || '',
    startDate: apiTrip.startDate || null,
    endDate: apiTrip.endDate || null,
  };
}

async function fetchTrips(): Promise<LocalTripDto[]> {
  try {
    const apiTrips = await getTrips();
    return apiTrips.map(mapTripDto);
  } catch (err) {
    console.error(err);
    return [];
  }
}

function formatRange(startDate: string | null, endDate: string | null) {
  if (!startDate || !endDate) return "Dates TBD";
  const start = new Date(startDate);
  const end = new Date(endDate);
  const startFmt = start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const endFmt = end.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: start.getFullYear() === end.getFullYear() ? undefined : "numeric",
  });
  return `${startFmt} - ${endFmt}`;
}

export default async function TripsPage() {
  const trips = await fetchTrips();
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase text-slate-500">Trips</p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Recent Trips
        </h1>
        <p className="text-slate-600">
          Add, edit, and keep track of upcoming travel plans.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {trips.length === 0 ? (
          <p className="text-sm text-slate-600">No trips yet.</p>
        ) : (
          trips.map((trip) => (
            <Link
              key={trip.id}
              href={`/trips/${trip.id}`}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
            >
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-slate-900">
                  {trip.titleOrDestination}
                </h2>
                <p className="text-sm text-slate-600">
                  {formatRange(trip.startDate, trip.endDate)}
                </p>
              </div>
              <p className="mt-3 text-sm font-medium text-slate-700 underline underline-offset-4">
                View trip
              </p>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}

