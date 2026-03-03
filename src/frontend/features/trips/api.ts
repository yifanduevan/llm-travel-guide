import { apiGet, apiPost } from '../../lib/apiClient';
import { TripDto, AccommodationDto, DiningReservationDto, TransportSegmentDto, ActivityDto } from '../../lib/types';
import { mockTrips, mockTrip, mockAccommodations, mockDiningReservations, mockTransportSegments, mockActivities } from './mock';

export type GenerateTripRequest = {
  titleOrDestination: string;
  startDate: string;
  endDate: string;
  travelers: "SOLO" | "COUPLE" | "FAMILY" | "GROUP";
  budget: "BUDGET" | "MEDIUM" | "LUXURY";
  interests: string[];
};

/**
 * Get all trips.
 * @returns Promise<TripDto[]>
 */
export async function getTrips(): Promise<TripDto[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return mockTrips;
  }
  return apiGet<TripDto[]>('/api/trips');
}

/**
 * Get a single trip by ID.
 * @param id - The trip ID.
 * @returns Promise<TripDto>
 */
export async function getTrip(id: string): Promise<TripDto> {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return mockTrips.find(t => t.id === id) || mockTrip;
  }
  return apiGet<TripDto>(`/api/trips/${id}`);
}

/**
 * Get accommodations for a trip.
 * @param tripId - The trip ID.
 * @returns Promise<AccommodationDto[]>
 */
export async function getAccommodations(tripId: string): Promise<AccommodationDto[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return mockAccommodations.filter(a => a.tripId === tripId);
  }
  return apiGet<AccommodationDto[]>(`/api/trips/${tripId}/accommodations`);
}

/**
 * Get dining reservations for a trip.
 * @param tripId - The trip ID.
 * @returns Promise<DiningReservationDto[]>
 */
export async function getDiningReservations(tripId: string): Promise<DiningReservationDto[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return mockDiningReservations.filter(d => d.tripId === tripId);
  }
  return apiGet<DiningReservationDto[]>(`/api/trips/${tripId}/dining-reservations`);
}

/**
 * Get transport segments for a trip.
 * @param tripId - The trip ID.
 * @returns Promise<TransportSegmentDto[]>
 */
export async function getTransportSegments(tripId: string): Promise<TransportSegmentDto[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return mockTransportSegments.filter(t => t.tripId === tripId);
  }
  return apiGet<TransportSegmentDto[]>(`/api/trips/${tripId}/transport-segments`);
}

/**
 * Get activities for a trip.
 * @param tripId - The trip ID.
 * @returns Promise<ActivityDto[]>
 */
export async function getActivities(tripId: string): Promise<ActivityDto[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return mockActivities.filter(a => a.tripId === tripId);
  }
  return apiGet<ActivityDto[]>(`/api/trips/${tripId}/activities`);
}

export async function generateTrip(request: GenerateTripRequest): Promise<TripDto> {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return {
      id: crypto.randomUUID(),
      titleOrDestination: request.titleOrDestination,
      startDate: request.startDate,
      endDate: request.endDate,
      travelers: request.travelers,
      budget: request.budget,
      status: "DRAFT",
      notes: `Mock generated plan for ${request.titleOrDestination}.`,
    };
  }
  return apiPost<GenerateTripRequest, TripDto>('/api/trips/generate', request);
}
