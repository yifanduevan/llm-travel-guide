import { fireEvent, render, screen } from "@testing-library/react";
import type { DiningReservation } from "../TripWorkspace";
import type { Reservation } from "@/features/trips/mock";
import DiningView from "../DiningView";
import { useRestaurants } from "@/features/trips/hooks/useRestaurants";
import { useReservations } from "@/features/trips/hooks/useReservations";

jest.mock("@/features/trips/hooks/useRestaurants", () => ({
  useRestaurants: jest.fn(),
}));

jest.mock("@/features/trips/hooks/useReservations", () => ({
  useReservations: jest.fn(),
}));

jest.mock("../dining/RestaurantCard", () => ({
  RestaurantCard: ({
    restaurant,
    onOpenDetail,
    onAddReservation,
  }: {
    restaurant: DiningReservation;
    onOpenDetail: () => void;
    onAddReservation: (restaurant: DiningReservation) => void;
  }) => (
    <div>
      <span>{restaurant.name}</span>
      <button onClick={onOpenDetail}>details-{restaurant.id}</button>
      <button onClick={() => onAddReservation(restaurant)}>reserve-{restaurant.id}</button>
    </div>
  ),
}));

jest.mock("../dining/RestaurantDetailModal", () => ({
  RestaurantDetailModal: ({ restaurant }: { restaurant: DiningReservation }) => (
    <div>detail-modal-{restaurant.name}</div>
  ),
}));

jest.mock("../dining/ReservationModal", () => ({
  ReservationModal: ({
    restaurant,
    onSave,
  }: {
    restaurant: DiningReservation;
    onSave: (reservation: Reservation) => void;
  }) => (
    <div>
      reservation-modal-{restaurant.name}
      <button
        onClick={() =>
          onSave({
            restaurantId: restaurant.id,
            name: "Alex",
            partySize: 2,
            datetimeLocal: "2026-04-10T19:00",
            confirmationCode: "ABC123",
          })
        }
      >
        save-reservation
      </button>
    </div>
  ),
}));

jest.mock("../dining/ReservationViewModal", () => ({
  ReservationViewModal: () => <div>view-reservation-modal</div>,
}));

jest.mock("../dining/AddRestaurantModal", () => ({
  AddRestaurantModal: ({
    onSave,
  }: {
    onSave: (restaurant: DiningReservation, reservation?: Reservation) => void;
  }) => (
    <div>
      add-restaurant-modal
      <button
        onClick={() =>
          onSave(
            {
              id: "added-1",
              name: "New Bistro",
              time: null,
              cuisine: "French",
              priceLevel: "MEDIUM",
              status: "pending",
              address: "123 Main St",
              notes: null,
              confirmationCode: null,
              partySize: 2,
              imageUrl: null,
            },
            {
              restaurantId: "added-1",
              name: "Taylor",
              partySize: 2,
              datetimeLocal: "2026-04-10T18:00",
              confirmationCode: "NEW123",
            },
          )
        }
      >
        save-restaurant
      </button>
    </div>
  ),
}));

const mockedUseRestaurants = jest.mocked(useRestaurants);
const mockedUseReservations = jest.mocked(useReservations);

describe("DiningView", () => {
  const upsertReservation = jest.fn();
  const getReservation = jest.fn();
  const reservations = {};

  beforeEach(() => {
    upsertReservation.mockReset();
    getReservation.mockReset();
    mockedUseRestaurants.mockReset();
    mockedUseReservations.mockReset();

    mockedUseReservations.mockReturnValue({
      reservations,
      getReservation,
      upsertReservation,
    });
  });

  it("renders an error state when restaurant loading fails", () => {
    mockedUseRestaurants.mockReturnValue({
      restaurants: [],
      loading: false,
      error: "Backend unavailable",
    });

    render(<DiningView tripId="trip-1" tripStartDate="2026-04-10" />);

    expect(screen.getByText("Couldn't load dining options")).toBeInTheDocument();
    expect(screen.getByText("Backend unavailable")).toBeInTheDocument();
  });

  it("renders restaurants from the hook", () => {
    mockedUseRestaurants.mockReturnValue({
      restaurants: [
        {
          id: "rest-1",
          name: "Le Gourmet",
          time: null,
          cuisine: "French",
          priceLevel: "HIGH",
          status: "confirmed",
          address: "Paris",
          notes: null,
          confirmationCode: null,
          partySize: 2,
          imageUrl: null,
        },
      ],
      loading: false,
      error: null,
    });

    render(<DiningView tripId="trip-1" tripStartDate="2026-04-10" />);

    expect(screen.getByText("Le Gourmet")).toBeInTheDocument();
    expect(screen.getByText("Gastronomy")).toBeInTheDocument();
  });

  it("allows adding a restaurant and persists its reservation through the hook", () => {
    mockedUseRestaurants.mockReturnValue({
      restaurants: [],
      loading: false,
      error: null,
    });

    render(<DiningView tripId="trip-1" tripStartDate="2026-04-10" />);

    fireEvent.click(screen.getByRole("button", { name: /add restaurant/i }));

    expect(screen.getByText("add-restaurant-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "save-restaurant" }));

    expect(screen.getByText("New Bistro")).toBeInTheDocument();
    expect(upsertReservation).toHaveBeenCalledWith(
      "added-1",
      expect.objectContaining({
        restaurantId: "added-1",
        confirmationCode: "NEW123",
      }),
    );
  });
});
