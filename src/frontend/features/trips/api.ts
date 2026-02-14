import { apiGet } from '../../lib/apiClient';
import { TripDto, AccommodationDto, DiningReservationDto, TransportSegmentDto, ActivityDto } from '../../lib/types';
import { mockTrips, mockTrip, mockAccommodations, mockDiningReservations, mockTransportSegments, mockActivities, getMockItinerary } from './mock';
import type { ItineraryDay, ItineraryItem } from './itineraryTypes';

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
    return mockAccommodations.filter(a => a.id === tripId); // Assuming id matches tripId for simplicity
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
    return mockActivities.filter(a => a.id === tripId);
  }
  return apiGet<ActivityDto[]>(`/api/trips/${tripId}/activities`);
}

/**
 * Get itinerary for a trip.
 * @param tripId - The trip ID.
 * @returns Promise<ItineraryDay[]>
 */
export async function getItinerary(tripId: string): Promise<ItineraryDay[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return getMockItinerary(tripId);
  }

  try {
    const payload = await apiGet<unknown>(`/api/trips/${tripId}/itinerary`);
    const mapped = mapItineraryPayload(payload);
    if (mapped.length > 0) {
      return mapped;
    }
  } catch {
    // Fall back to aggregated itinerary when endpoint is not available.
  }

  return buildItineraryFromRelatedEndpoints(tripId);
}

function mapItineraryPayload(payload: unknown): ItineraryDay[] {
  if (!payload) return [];
  if (Array.isArray(payload)) {
    return payload.map(coerceItineraryDay).filter(Boolean) as ItineraryDay[];
  }
  if (typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const rawDays = record.days ?? record.itinerary ?? record.items;
    if (Array.isArray(rawDays)) {
      return rawDays.map(coerceItineraryDay).filter(Boolean) as ItineraryDay[];
    }
  }
  return [];
}

function coerceItineraryDay(raw: unknown): ItineraryDay | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const items = Array.isArray(record.items) ? record.items.map(coerceItineraryItem).filter(Boolean) : [];
  return {
    label: String(record.label ?? record.title ?? 'Day'),
    date: String(record.date ?? record.day ?? 'TBD'),
    active: Boolean(record.active),
    items: items as ItineraryItem[],
  };
}

function coerceItineraryItem(raw: unknown): ItineraryItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  return {
    icon: String(record.icon ?? 'event'),
    title: String(record.title ?? 'Untitled'),
    time: String(record.time ?? 'TBD'),
    note: String(record.note ?? ''),
    image: record.image ? String(record.image) : undefined,
    muted: Boolean(record.muted),
  };
}

async function buildItineraryFromRelatedEndpoints(tripId: string): Promise<ItineraryDay[]> {
  const [segments, accommodations, dining, activities] = await Promise.all([
    getTransportSegments(tripId),
    getAccommodations(tripId),
    getDiningReservations(tripId),
    getActivities(tripId),
  ]);

  const entries: Array<{ key: string; date?: Date; item: ItineraryItem }> = [];

  segments.forEach(segment => {
    const date = segment.startTime ? new Date(segment.startTime) : undefined;
    entries.push({
      key: date ? date.toDateString() : 'unscheduled',
      date,
      item: {
        icon: transportIcon(segment.type),
        title: segment.title || 'Transportation',
        time: formatTime(segment.startTime),
        note: formatRouteNote(segment),
        image: segment.imageUrl ?? undefined,
      },
    });
  });

  accommodations.forEach(stay => {
    const date = stay.checkIn ? new Date(stay.checkIn) : undefined;
    entries.push({
      key: date ? date.toDateString() : 'unscheduled',
      date,
      item: {
        icon: 'hotel',
        title: stay.name || 'Accommodation',
        time: formatTime(stay.checkIn),
        note: formatStayNote(stay),
        image: stay.imageUrl ?? undefined,
      },
    });
  });

  dining.forEach(reservation => {
    const date = reservation.time ? new Date(reservation.time) : undefined;
    entries.push({
      key: date ? date.toDateString() : 'unscheduled',
      date,
      item: {
        icon: 'restaurant',
        title: reservation.name || 'Dining',
        time: formatTime(reservation.time),
        note: formatDiningNote(reservation),
        image: reservation.imageUrl ?? undefined,
      },
    });
  });

  activities.forEach(activity => {
    entries.push({
      key: 'unscheduled',
      item: {
        icon: 'local_activity',
        title: activity.title || 'Activity',
        time: 'TBD',
        note: activity.description || 'Details to be confirmed.',
        image: activity.imageUrl ?? undefined,
        muted: true,
      },
    });
  });

  const grouped = new Map<string, { date?: Date; items: ItineraryItem[] }>();
  entries.forEach(entry => {
    const existing = grouped.get(entry.key);
    if (existing) {
      existing.items.push(entry.item);
      if (!existing.date && entry.date) {
        existing.date = entry.date;
      }
    } else {
      grouped.set(entry.key, { date: entry.date, items: [entry.item] });
    }
  });

  const scheduledKeys = Array.from(grouped.keys()).filter(key => key !== 'unscheduled');
  scheduledKeys.sort((a, b) => {
    const dateA = grouped.get(a)?.date?.getTime() ?? 0;
    const dateB = grouped.get(b)?.date?.getTime() ?? 0;
    return dateA - dateB;
  });

  const orderedKeys = grouped.has('unscheduled')
    ? [...scheduledKeys, 'unscheduled']
    : scheduledKeys;

  const days = orderedKeys.map((key, index) => {
    const group = grouped.get(key);
    const date = group?.date;
    const label = key === 'unscheduled' ? 'Unscheduled' : `Day ${index + 1}`;
    const dateLabel = date ? formatDateLabel(date) : 'TBD';
    return {
      label,
      date: dateLabel,
      active: index === 0,
      items: group?.items ?? [],
    };
  });

  return days;
}

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

function formatTime(value: string | null | undefined): string {
  if (!value) return 'TBD';
  const dt = new Date(value);
  return dt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function transportIcon(type?: string): string {
  switch ((type ?? '').toLowerCase()) {
    case 'flight':
      return 'flight';
    case 'train':
      return 'train';
    case 'car':
      return 'directions_car';
    case 'bus':
      return 'directions_bus';
    default:
      return 'commute';
  }
}

function formatRouteNote(segment: TransportSegmentDto): string {
  const start = segment.startLocation ?? segment.startCode ?? 'TBD';
  const end = segment.endLocation ?? segment.endCode ?? 'TBD';
  return `${start} → ${end}`;
}

function formatStayNote(stay: AccommodationDto): string {
  if (stay.address) return stay.address;
  if (stay.roomType) return stay.roomType;
  return 'Details to be confirmed.';
}

function formatDiningNote(reservation: DiningReservationDto): string {
  if (reservation.address) return reservation.address;
  if (reservation.notes) return reservation.notes;
  return 'Reservation details to be confirmed.';
}