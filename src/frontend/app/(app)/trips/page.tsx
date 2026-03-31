import { getTrips } from "@/features/trips/api";
import { TripDto } from "@/lib/types";
import TripsListClient from "./TripsListClient";

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
      <TripsListClient initialTrips={trips} />
    </section>
  );
}
