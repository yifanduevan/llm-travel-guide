import { TripDto, AccommodationDto, DiningReservationDto, TransportSegmentDto } from '../../lib/types';
import type { ItineraryDay } from './itineraryTypes';

export const mockTrips: TripDto[] = [
  {
    id: '1',
    titleOrDestination: 'Paris Trip',
    startDate: '2023-06-01',
    endDate: '2023-06-10',
    travelers: '2 adults',
    budget: 'medium',
    notes: 'Exciting trip to Paris',
    status: 'planned',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    titleOrDestination: 'Tokyo Adventure',
    startDate: '2023-07-01',
    endDate: '2023-07-15',
    travelers: '1 adult',
    budget: 'high',
    notes: 'Explore Tokyo',
    status: 'confirmed',
    createdAt: '2023-02-01T00:00:00Z',
    updatedAt: '2023-02-01T00:00:00Z',
  },
];

export const mockTrip: TripDto = mockTrips[0];

export const mockAccommodations: AccommodationDto[] = [
  {
    id: '1',
    name: 'Hotel Paris',
    address: '123 Rue de Paris',
    roomType: 'Double',
    checkIn: '2023-06-01',
    checkOut: '2023-06-10',
    rate: 150,
    currency: 'EUR',
    status: 'confirmed',
    confirmationCode: 'ABC123',
    tags: ['luxury', 'city center'],
    imageUrl: 'https://example.com/hotel.jpg',
    notes: 'Great location',
  },
  {
    id: '2',
    name: 'Hotel Tokyo Trip Nishinippori',
    address: '5 Chome-18-14 Nishinippori',
    roomType: 'Single',
    checkIn: '2023-07-01',
    checkOut: '2023-07-15',
    rate: 14000,
    currency: 'JPY',
    status: 'confirmed',
    confirmationCode: 'XYZ789',
    tags: ['modern', 'subway access'],
    imageUrl: 'https://pix8.agoda.net/hotelImages/8478208/-1/cd3801afd1e27d664c8250c247448139.jpg?ca=12&ce=1&s=1024x',
    notes: 'Convenient for exploring Tokyo',
  },
];

export const mockDiningReservations: Array<DiningReservationDto & { tripId: string }> = [
  {
    id: 'paris-1',
    tripId: '1',
    name: 'Le Gourmet',
    time: '2023-06-05T19:00:00Z',
    cuisine: 'French',
    priceTier: 'high',
    status: 'confirmed',
    address: '456 Avenue Gourmet',
    notes: 'Reservation for 2',
    confirmationCode: 'DEF456',
    partySize: 2,
    imageUrl: 'https://example.com/restaurant.jpg',
  },
  {
    id: 'tokyo-1',
    tripId: '2',
    name: 'Sushi Zen',
    time: '2023-07-08T20:00:00Z',
    cuisine: 'Japanese',
    priceTier: 'medium',
    status: 'confirmed',
    address: '789 Ginza District, Tokyo',
    notes: 'Authentic sushi experience',
    confirmationCode: 'JKL012',
    partySize: 1,
    imageUrl: 'https://ramensushizen.com/__static/a2a391fd6a246dbf/image_laptop',
  },

  {
    id: 'tokyo-2',
    tripId: '2',
    name: 'GINZA syabuki',
    time: '2023-07-09T20:00:00Z',
    cuisine: 'Japanese',
    priceTier: 'high',
    status: 'confirmed',
    address: '日本〒104-0061 Tokyo, Chuo City, Ginza, 5 Chome−9−5 チアーズ銀座 4F',
    notes: 'Very good services',
    confirmationCode: '000001',
    partySize: 1,
    imageUrl: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/30/e8/c9/b0/caption.jpg?w=1000&h=-1&s=1',
  },
];

export type Reservation = {
  restaurantId: string;
  name: string;
  partySize: number;
  datetimeLocal: string;
  confirmationCode: string;
  notes?: string;
};

export const mockReservations: Record<string, Reservation> = {
  '2-tokyo-1': {
    restaurantId: '2-tokyo-1',
    name: 'Jack',
    partySize: 1,
    datetimeLocal: '2023-07-08T16:00',
    confirmationCode: 'JKL012',
    notes: 'Authentic sushi experience',
  },
  '2-tokyo-2': {
    restaurantId: '2-tokyo-2',
    name: 'Jack',
    partySize: 1,
    datetimeLocal: '2023-07-09T16:00',
    confirmationCode: '000001',
    notes: 'Very good services',
  },
};

export function getMockReservationByRestaurantId(
  id: string,
): Promise<Reservation | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockReservations[id] ?? null);
    }, 300);
  });
}

export const mockTransportSegments: TransportSegmentDto[] = [
  // Trip 1 (Paris) segments
  {
    id: 'seg_paris_1',
    tripId: '1',
    type: 'FLIGHT',
    title: 'Flight to Paris',
    startTime: '2023-06-01T10:00:00Z',
    startTz: 'UTC',
    startLocation: 'New York',
    startCode: 'JFK',
    endTime: '2023-06-01T22:00:00Z',
    endTz: 'UTC',
    endLocation: 'Paris',
    endCode: 'CDG',
    durationText: '12 hours',
    status: 'confirmed',
    confirmationCode: 'GHI789',
    ticketUrl: 'https://example.com/ticket',
    completed: false,
    imageUrl: 'https://example.com/flight.jpg',
  },
  {
    id: 'seg_paris_2',
    tripId: '1',
    type: 'TRAIN',
    title: 'Train to Versailles',
    startTime: '2023-06-02T09:30:00Z',
    startTz: 'UTC',
    startLocation: 'Paris',
    startCode: 'CDG',
    endTime: '2023-06-02T10:45:00Z',
    endTz: 'UTC',
    endLocation: 'Versailles',
    endCode: 'VSL',
    durationText: '1.25 hours',
    status: 'confirmed',
    confirmationCode: 'TRN123',
    ticketUrl: 'https://example.com/train-ticket',
    completed: false,
    imageUrl: 'https://example.com/train.jpg',
  },
  {
    id: 'seg_paris_3',
    tripId: '1',
    type: 'BUS',
    title: 'City Bus Tour',
    startTime: '2023-06-03T14:00:00Z',
    startTz: 'UTC',
    startLocation: 'Paris Center',
    startCode: 'CTR',
    endTime: '2023-06-03T17:00:00Z',
    endTz: 'UTC',
    endLocation: 'Eiffel Tower',
    endCode: 'EFT',
    durationText: '3 hours',
    status: 'confirmed',
    confirmationCode: 'BUS456',
    ticketUrl: 'https://example.com/bus-ticket',
    completed: false,
    imageUrl: 'https://example.com/bus.jpg',
  },
  {
    id: 'seg_paris_4',
    tripId: '1',
    type: 'SHIP',
    title: 'Seine River Cruise',
    startTime: '2023-06-04T18:00:00Z',
    startTz: 'UTC',
    startLocation: 'Port de Suffren',
    startCode: 'PSF',
    endTime: '2023-06-04T20:00:00Z',
    endTz: 'UTC',
    endLocation: 'Port de Suffren',
    endCode: 'PSF',
    durationText: '2 hours',
    status: 'confirmed',
    confirmationCode: 'SHIP789',
    ticketUrl: 'https://example.com/cruise-ticket',
    completed: false,
    imageUrl: 'https://example.com/cruise.jpg',
  },
  // Trip 2 (Tokyo) segments
  {
    id: 'seg_tokyo_1',
    tripId: '2',
    type: 'FLIGHT',
    title: 'Flight to Tokyo',
    startTime: '2023-07-01T22:00:00Z',
    startTz: 'America/Los_Angeles',
    startLocation: 'Los Angeles',
    startCode: 'LAX',
    endTime: '2023-07-02T09:00:00Z',
    endTz: 'Asia/Tokyo',
    endLocation: 'Tokyo',
    endCode: 'NRT',
    durationText: '11 hours',
    status: 'confirmed',
    confirmationCode: 'MNO345',
    ticketUrl: 'https://example.com/tokyo-ticket',
    completed: false,
    imageUrl: 'https://example.com/tokyo-flight.jpg',
  },
  {
    id: 'seg_tokyo_2',
    tripId: '2',
    type: 'CAR',
    title: 'Car Rental - Tokyo',
    startTime: '2023-07-02T11:00:00Z',
    startTz: 'Asia/Tokyo',
    startLocation: 'Narita Airport',
    startCode: 'NRT',
    endTime: '2023-07-02T11:40:00Z',
    endTz: 'Asia/Tokyo',
    endLocation: 'Tokyo Downtown',
    endCode: 'TYO',
    durationText: '40 mins',
    status: 'confirmed',
    confirmationCode: 'CAR101',
    ticketUrl: 'https://example.com/car-rental',
    completed: false,
    imageUrl: 'https://example.com/car.jpg',
  },
];

export const mockActivities = [
  {
    id: '1',
    title: 'Louvre Museum Masterpieces Tour',
    price: '€75',
    rating: '4.9',
    badge: 'Top Rated',
    badgeTone: 'primary',
    imageUrl:
      'https://images.unsplash.com/photo-1543349689-9a4d426bee8d?auto=format&fit=crop&w=800&q=80',
    description:
      'Skip-the-line guided tour featuring the Mona Lisa, Venus de Milo, and more with a certified art historian.',
    pills: ['3 Hours', 'English / French', 'Mobile Ticket'],
  },
  {
    id: '1',
    title: 'Seine River Sunset Cruise',
    price: '€25',
    rating: '4.7',
    badge: 'Selling Fast',
    badgeTone: 'accent',
    imageUrl:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    description: 'Enjoy panoramic views of Paris monuments at dusk with audio commentary.',
    pills: ['1 Hour', 'Audio Guide'],
  },
  {
    id: '1',
    title: 'Montmartre Cheese & Wine',
    price: '€95',
    rating: '5.0',
    imageUrl:
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80',
    description:
      'Walking tour through the historic artist district with four tasting stops for local delicacies.',
    pills: ['3.5 Hours', 'Food Inc.'],
  },
  {
    id: '2',
    title: 'Tokyo Food Tour',
    price: '¥8,500',
    rating: '4.8',
    badge: 'Popular',
    badgeTone: 'primary',
    imageUrl:
      'https://imgs.gotrip.hk/wp-content/uploads/2020/10/65_18625544735f99bd2eb50ac.jpg',
    description:
      'Discover authentic Tokyo flavors with local guides through traditional markets and hidden gems.',
    pills: ['4 Hours', 'English / Japanese', 'Food Inc.'],
  },
  {
    id: '2',
    title: 'Shibuya Sky',
    price: '¥2,000',
    rating: '4.6',
    imageUrl:
      'https://media.timeout.com/images/105547051/1920/1080/image.webp',
    description: 'Experience breathtaking panoramic views of Tokyo from the famous Shibuya Sky.',
    pills: ['1 Hour', 'Mobile Ticket'],
  },
];

const mockItinerariesByTripId: Record<number, ItineraryDay[]> = {
  1: [
    {
      label: "Day 1: Arrival & Settlement",
      date: "Saturday, Oct 12",
      active: true,
      items: [
        {
          icon: "flight_land",
          title: "Land at CDG Airport",
          time: "11:05 AM",
          note:
            'Terminal 2E. Driver will wait at Exit 4 holding a sign "Smith Family".',
        },
        {
          icon: "hotel",
          title: "Check-in: The Luminary Hotel",
          time: "01:00 PM",
          note: "Early check-in requested. Confirmation #FR-88219-X.",
        },
        {
          icon: "restaurant",
          title: "Lunch at The Green Kitchen",
          time: "01:30 PM",
          note: "Table for 2. Vegetarian menu available.",
        },
      ],
    },
    {
      label: "Day 2: Art & Culture",
      date: "Sunday, Oct 13",
      items: [
        {
          icon: "museum",
          title: "Louvre Museum Masterpieces Tour",
          time: "09:30 AM",
          note: "Meet guide at the Pyramid entrance. Skip-the-line tickets included.",
          image:
            "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/13/ce/b7/65.jpg",
        },
        {
          icon: "directions_walk",
          title: "Free Time: Tuileries Garden",
          time: "01:00 PM",
          note: "Grab a sandwich from Paul's and sit by the fountain.",
          muted: true,
        },
      ],
    },
  ],
  2: [
    {
      label: "Day 1: Arrival in Tokyo",
      date: "Monday, Jul 1",
      active: true,
      items: [
        {
          icon: "flight_land",
          title: "Arrive at Narita Airport",
          time: "02:15 PM",
          note: "Immigration + baggage. Pick up JR Pass at Terminal 1.",
        },
        {
          icon: "train",
          title: "Narita Express to Shibuya",
          time: "03:40 PM",
          note: "Reserved seats car 3. Transfer at Tokyo Station.",
        },
        {
          icon: "hotel",
          title: "Check-in: Shibuya Stream Excel Hotel",
          time: "05:30 PM",
          note: "Request high-floor room. Confirmation #TYO-2281.",
        },
        {
          icon: "restaurant",
          title: "Dinner at Uobei Shibuya",
          time: "07:00 PM",
          note: "Conveyor-belt sushi. Expect short queue.",
        },
      ],
    },
    {
      label: "Day 2: Shibuya & Harajuku",
      date: "Tuesday, Jul 2",
      items: [
        {
          icon: "photo_camera",
          title: "Shibuya Crossing & Hachiko",
          time: "09:00 AM",
          note: "Photo stop at the statue, then walk to Scramble Square.",
          image:
            "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=900&q=80",
        },
        {
          icon: "local_activity",
          title: "Meiji Shrine",
          time: "11:00 AM",
          note: "Walk through Yoyogi Park to the main torii gate.",
        },
        {
          icon: "restaurant",
          title: "Lunch at Afuri Ramen",
          time: "01:00 PM",
          note: "Yuzu shio ramen recommended.",
        },
        {
          icon: "shopping_bag",
          title: "Takeshita Street browsing",
          time: "02:30 PM",
          note: "Crepes and souvenir shopping.",
        },
      ],
    },
    {
      label: "Day 3: Asakusa & Odaiba",
      date: "Wednesday, Jul 3",
      items: [
        {
          icon: "temple_buddhist",
          title: "Senso-ji Temple",
          time: "09:30 AM",
          note: "Arrive early to avoid crowds. Explore Nakamise Street.",
        },
        {
          icon: "local_activity",
          title: "teamLab Planets",
          time: "01:30 PM",
          note: "Tickets at 1:30 PM. Bring shorts for water section.",
        },
        {
          icon: "restaurant",
          title: "Dinner in Odaiba",
          time: "06:30 PM",
          note: "Waterfront views near DiverCity Tokyo Plaza.",
          muted: true,
        },
      ],
    },
  ],
};

export function getMockItinerary(tripId?: string | number): ItineraryDay[] {
  if (tripId === undefined || tripId === null) {
    return [];
  }
  const parsed = typeof tripId === "number" ? tripId : Number.parseInt(tripId, 10);
  if (Number.isNaN(parsed)) {
    return [];
  }
  return mockItinerariesByTripId[parsed] ?? [];
}