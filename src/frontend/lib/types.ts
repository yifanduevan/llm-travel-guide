// filepath: src/frontend/lib/types.ts
export interface TripDto {
  id?: string;
  titleOrDestination?: string;
  startDate?: string;
  endDate?: string;
  travelers?: string;
  budget?: string;
  notes?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AccommodationDto {
  id?: string;
  tripId?: string;
  name?: string;
  address?: string;
  roomType?: string;
  checkIn?: string;
  checkOut?: string;
  rate?: number;
  currency?: string;
  status?: string;
  confirmationCode?: string;
  tags?: string[];
  imageUrl?: string;
  notes?: string;
}

export interface DiningReservationDto {
  id?: string;
  name?: string;
  time?: string;
  cuisine?: string;
  priceTier?: string;
  status?: string;
  address?: string;
  notes?: string;
  confirmationCode?: string;
  partySize?: number;
  imageUrl?: string;
}

export interface TransportSegmentDto {
  id?: string;
  tripId?: string;
  type?: string;
  title?: string;
  startTime?: string;
  startTz?: string;
  startLocation?: string;
  startCode?: string;
  endTime?: string;
  endTz?: string;
  endLocation?: string;
  endCode?: string;
  durationText?: string;
  status?: string;
  confirmationCode?: string;
  ticketUrl?: string;
  completed?: boolean;
  imageUrl?: string;
}

export interface ActivityDto {
  id?: string;
  tripId?: string;
  title?: string;
  price?: string;
  rating?: string;
  badge?: string;
  badgeTone?: string;
  imageUrl?: string;
  description?: string;
  pills?: string[];
} 