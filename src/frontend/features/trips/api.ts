import { apiGet, apiPost } from '../../lib/apiClient';
import { TripDto, AccommodationDto, DiningReservationDto, TransportSegmentDto } from '../../lib/types';
import { mockTrips, mockTrip, mockAccommodations, mockDiningReservations, mockTransportSegments, getMockItinerary } from './mock';
import type { ItineraryDay, ItineraryItem } from './itineraryTypes';

export type CreateTripInput = {
  titleOrDestination: string;
  startDate: string | null;
  endDate: string | null;
  travelers: string;
  budget: string;
  interests?: string[];
  notes?: string | null;
  status?: string;
};

export type CreateTripOptions = {
  signal?: AbortSignal;
};

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
 * Create a trip.
 * @param input - Trip payload.
 * @param signal - Optional abort signal.
 * @returns Promise<TripDto>
 */
export async function createTrip(
  input: CreateTripInput,
  signal?: AbortSignal,
): Promise<TripDto> {
  const payload = {
    titleOrDestination: input.titleOrDestination,
    startDate: input.startDate ?? undefined,
    endDate: input.endDate ?? undefined,
    travelers: input.travelers,
    budget: input.budget,
    notes: input.notes ?? undefined,
    status: input.status ?? 'DRAFT',
  };

  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    const now = new Date().toISOString();
    const createdTrip: TripDto = {
      id: `mock-${Date.now()}`,
      ...payload,
      createdAt: now,
      updatedAt: now,
    };
    mockTrips.unshift(createdTrip);
    return createdTrip;
  }

  return apiPost<TripDto>('/api/trips', payload, { signal });
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

export async function generateTrip(request: GenerateTripRequest, init: RequestInit = {}): Promise<TripDto> {
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
  return apiPost<TripDto>('/api/trips/generate', request, init);
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

/**
 * Generate itinerary for a trip.
 * @param tripId - The trip ID.
 * @returns Promise<ItineraryDay[]>
 */
export async function generateItinerary(tripId: string): Promise<ItineraryDay[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    await wait(1200);
    return getMockItinerary(tripId);
  }

  try {
    const trip = await getTrip(tripId);
    const response = await fetch('/api/ai/itinerary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tripId,
        trip: {
          titleOrDestination: trip.titleOrDestination ?? '',
          startDate: trip.startDate ?? '',
          endDate: trip.endDate ?? '',
          travelers: trip.travelers ?? 'COUPLE',
          budget: trip.budget ?? 'MEDIUM',
          notes: trip.notes ?? null,
        },
      }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Itinerary endpoint is not implemented on backend (404).');
      }
      let message = `Failed to generate itinerary (${response.status})`;
      try {
        const payload = await response.json() as { error?: string };
        if (payload.error) {
          message = payload.error;
        }
      } catch {
      }
      throw new Error(message);
    }

    const payload = await response.json() as { days?: unknown[] };
    const mapped = mapLlmDaysToUi(payload.days);
    if (mapped.length > 0) {
      return mapped;
    }
    throw new Error('Invalid LLM response');
  } catch (error) {
    throw error;
  }
}

function mapLlmDaysToUi(days: unknown): ItineraryDay[] {
  if (!Array.isArray(days)) return [];

  return days
    .filter((day): day is Record<string, unknown> => !!day && typeof day === 'object')
    .map((day, index) => {
      const rawDate = String(day.date ?? '');
      const parsedDate = new Date(`${rawDate}T00:00:00`);
      const dateLabel = Number.isNaN(parsedDate.getTime())
        ? rawDate || 'TBD'
        : parsedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

      const rawItems = Array.isArray(day.items) ? day.items : [];
      const items = rawItems
        .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
        .map((item) => {
          const description = String(item.description ?? '').trim();
          const locationText = String(item.locationText ?? '').trim();
          const note = [description, locationText].filter(Boolean).join(' • ');

          return {
            icon: 'local_activity',
            title: String(item.title ?? 'Activity'),
            time: String(item.time ?? 'TBD'),
            note: note || 'Details to be confirmed.',
          } satisfies ItineraryItem;
        });

      return {
        label: `Day ${index + 1}`,
        date: dateLabel,
        active: index === 0,
        items,
      } satisfies ItineraryDay;
    });
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
  const [segments, accommodations, dining] = await Promise.all([
    getTransportSegments(tripId),
    getAccommodations(tripId),
    getDiningReservations(tripId),
  ]);
  const activities: never[] = [];

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

type GeneratedItineraryResponse = {
  days: Array<{
    date: string;
    items: Array<{
      title: string;
      description: string;
      time: string;
      category: string;
      locationText: string;
    }>;
  }>;
};

export async function generateItinerary(tripId: string): Promise<ItineraryDay[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return getMockItinerary(tripId);
  }

  const response = await apiPost<GeneratedItineraryResponse>(
    `/api/trips/${tripId}/generate-itinerary`,
    undefined,
  );

  if (!response?.days) return [];

  return response.days.map((day, index) => ({
    label: `Day ${index + 1}`,
    date: day.date ?? 'TBD',
    active: index === 0,
    items: (day.items ?? []).map((item) => ({
      icon: 'event',
      title: item.title ?? 'Untitled',
      time: item.time ?? 'TBD',
      note: item.description ?? item.locationText ?? '',
      muted: false,
    })),
  }));
}