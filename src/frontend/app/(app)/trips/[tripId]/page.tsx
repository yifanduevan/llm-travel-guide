import Link from "next/link";
import TripWorkspace from "@/features/trips/components/TripWorkspace";
import {
  Accommodation,
  DiningReservation,
  TransportSegment,
} from "@/features/trips/components/TripWorkspace";
import { normalizeTransportMode } from "@/features/trips/iconMap";
import { getTrip, getTransportSegments, getDiningReservations, getAccommodations } from "@/features/trips/api";
import { TripDto, AccommodationDto, DiningReservationDto, TransportSegmentDto } from "@/lib/types";

type TripDetailPageProps = {
  params: Promise<{ tripId: string }>;
};

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

function mapAccommodationDto(apiAcc: AccommodationDto): Accommodation {
  return {
    id: apiAcc.id || '',
    name: apiAcc.name || '',
    address: apiAcc.address || null,
    roomType: apiAcc.roomType || null,
    checkIn: apiAcc.checkIn || null,
    checkOut: apiAcc.checkOut || null,
    rate: apiAcc.rate?.toString() || null,
    currency: apiAcc.currency || null,
    status: apiAcc.status || '',
    confirmationCode: apiAcc.confirmationCode || null,
    tags: apiAcc.tags || null,
    imageUrl: apiAcc.imageUrl || null,
    notes: apiAcc.notes || null,
  };
}

function mapDiningReservationDto(apiRes: DiningReservationDto): DiningReservation {
  return {
    id: apiRes.id || '',
    name: apiRes.name || '',
    time: apiRes.time || null,
    cuisine: apiRes.cuisine || null,
    priceTier: apiRes.priceTier || null,
    status: apiRes.status || '',
    address: apiRes.address || null,
    notes: apiRes.notes || null,
    confirmationCode: apiRes.confirmationCode || null,
    partySize: apiRes.partySize || null,
    imageUrl: apiRes.imageUrl || null,
  };
}

function mapTransportSegmentDto(apiSeg: TransportSegmentDto): TransportSegment {
  return {
    id: apiSeg.id || '',
    mode: normalizeTransportMode(apiSeg.type),
    type: apiSeg.type || null,
    title: apiSeg.title || '',
    startTime: apiSeg.startTime || null,
    startLocation: apiSeg.startLocation || null,
    endTime: apiSeg.endTime || null,
    endLocation: apiSeg.endLocation || null,
    durationText: apiSeg.durationText || null,
    status: apiSeg.status || '',
    confirmationCode: apiSeg.confirmationCode || null,
    ticketsUrl: apiSeg.ticketUrl || null,
    ticketUrl: apiSeg.ticketUrl || null,
    completed: !!apiSeg.completed,
  };
}

async function fetchTrip(tripId: string): Promise<LocalTripDto | null> {
  try {
    const apiTrip = await getTrip(tripId);
    return mapTripDto(apiTrip);
  } catch {
    return null;
  }
}

async function fetchSegments(tripId: string): Promise<TransportSegment[]> {
  try {
    const apiSegments = await getTransportSegments(tripId);
    return apiSegments.map(mapTransportSegmentDto);
  } catch {
    return [];
  }
}

async function fetchReservations(tripId: string): Promise<DiningReservation[]> {
  try {
    const apiReservations = await getDiningReservations(tripId);
    return apiReservations.map(mapDiningReservationDto);
  } catch {
    return [];
  }
}

async function fetchAccommodations(tripId: string): Promise<Accommodation[]> {
  try {
    const apiAccommodations = await getAccommodations(tripId);
    return apiAccommodations.map(mapAccommodationDto);
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
          href={`?edit=true`}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 shadow-sm btn-primary"
        >
          Edit trip
        </Link>
        <Link
          href="/trips"
          className="rounded-lg border border-slate-400 px-4 py-2 transition hover:border-slate-900 hover:bg-slate-50"
          style={{ color: '#5e5e5e' }}
        >
          Back to trips
        </Link>
      </div>
    </div>
  );
}