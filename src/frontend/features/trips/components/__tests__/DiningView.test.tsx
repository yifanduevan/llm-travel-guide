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
    reservation,
    onOpenDetail,
    onAddReservation,
    onViewReservation,
    onEditCard,
    onDeleteReservation,
  }: {
    restaurant: DiningReservation;
    reservation: Reservation | null;
    onOpenDetail: () => void;
    onAddReservation: (restaurant: DiningReservation) => void;
    onViewReservation: (restaurant: DiningReservation) => void;
    onEditCard: (restaurant: DiningReservation, reservation: Reservation | null) => void;
    onDeleteReservation: (restaurant: DiningReservation) => void;
  }) => (
    <div>
      <span>{restaurant.name}</span>
      <button onClick={onOpenDetail}>details-{restaurant.id}</button>
      <button onClick={() => onAddReservation(restaurant)}>reserve-{restaurant.id}</button>
      <button onClick={() => onViewReservation(restaurant)}>view-{restaurant.id}</button>
      <button onClick={() => onEditCard(restaurant, reservation)}>edit-{restaurant.id}</button>
      <button onClick={() => onDeleteReservation(restaurant)}>delete-{restaurant.id}</button>
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
            notes: "window seat",
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
              notes: "anniversary",
            },
          )
        }
      >
        save-restaurant
      </button>
    </div>
  ),
}));

jest.mock("../dining/DiningReservationEditModal", () => ({
  DiningReservationEditModal: ({
    open,
    form,
    formError,
    onFormChange,
    onSave,
  }: {
    open: boolean;
    form: {
      name: string;
      reservationPartySize: number;
      reservationTime: string;
      reservationCode: string;
      reservationName: string;
      reservationNotes: string;
      address: string;
      cuisine: string;
      priceLevel: "LOW" | "MEDIUM" | "HIGH";
      notes: string;
    };
    formError?: string | null;
    onFormChange: (next: unknown) => void;
    onSave: () => void;
  }) =>
    open ? (
      <div>
        dining-edit-modal
        {formError ? <p>{formError}</p> : null}
        <button
          onClick={() =>
            onFormChange({
              ...form,
              name: "",
            })
          }
        >
          make-invalid
        </button>
        <button
          onClick={() =>
            onFormChange({
              ...form,
              name: "Edited Bistro",
              reservationPartySize: 4,
              reservationTime: "2026-05-01T19:30",
              reservationCode: "EDT-11",
              reservationName: "Chris",
              reservationNotes: "updated",
            })
          }
        >
          make-valid
        </button>
        <button onClick={onSave}>save-edit</button>
      </div>
    ) : null,
}));

jest.mock("../ConfirmOverlay", () => ({
  __esModule: true,
  default: ({
    open,
    message,
    onConfirm,
    onCancel,
  }: {
    open: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) =>
    open ? (
      <div>
        <p>{message}</p>
        <button onClick={onConfirm}>confirm-delete</button>
        <button onClick={onCancel}>cancel-delete</button>
      </div>
    ) : null,
}));

const mockedUseRestaurants = jest.mocked(useRestaurants);
const mockedUseReservations = jest.mocked(useReservations);

const baseRestaurant: DiningReservation = {
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
};

describe("DiningView", () => {
  const upsertReservation = jest.fn();
  const getReservation = jest.fn();
  const removeReservation = jest.fn();

  beforeEach(() => {
    upsertReservation.mockReset();
    getReservation.mockReset();
    removeReservation.mockReset();
    mockedUseRestaurants.mockReset();
    mockedUseReservations.mockReset();

    mockedUseReservations.mockReturnValue({
      getReservation,
      upsertReservation,
      removeReservation,
    });
  });

  it("renders loading state", () => {
    mockedUseRestaurants.mockReturnValue({
      restaurants: [],
      loading: true,
      error: null,
    });

    const { container } = render(<DiningView tripId="trip-1" tripStartDate="2026-04-10" />);

    expect(screen.queryByText("Gastronomy")).not.toBeInTheDocument();
    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(4);
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

  it("renders empty state", () => {
    mockedUseRestaurants.mockReturnValue({
      restaurants: [],
      loading: false,
      error: null,
    });

    render(<DiningView tripId="trip-1" tripStartDate="2026-04-10" />);

    expect(screen.getByText("No restaurants yet")).toBeInTheDocument();
  });

  it("opens detail, view reservation, and add reservation modals", () => {
    mockedUseRestaurants.mockReturnValue({
      restaurants: [baseRestaurant],
      loading: false,
      error: null,
    });
    getReservation.mockReturnValue({
      restaurantId: "rest-1",
      name: "Alex",
      partySize: 2,
      datetimeLocal: "2026-04-10T19:00",
      confirmationCode: "ABC123",
      notes: "window",
    });

    render(<DiningView tripId="trip-1" tripStartDate="2026-04-10" editable />);

    fireEvent.click(screen.getByRole("button", { name: "details-rest-1" }));
    expect(screen.getByText("detail-modal-Le Gourmet")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "view-rest-1" }));
    expect(screen.getByText("view-reservation-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "reserve-rest-1" }));
    expect(screen.getByText("reservation-modal-Le Gourmet")).toBeInTheDocument();
  });

  it("shows API error when saving reservation fails", () => {
    mockedUseRestaurants.mockReturnValue({
      restaurants: [baseRestaurant],
      loading: false,
      error: null,
    });
    upsertReservation.mockImplementation(() => {
      throw new Error("save failed");
    });

    render(<DiningView tripId="trip-1" tripStartDate="2026-04-10" editable />);

    fireEvent.click(screen.getByRole("button", { name: "reserve-rest-1" }));
    fireEvent.click(screen.getByRole("button", { name: "save-reservation" }));

    expect(screen.getByText("save failed")).toBeInTheDocument();
  });

  it("allows adding a restaurant and persists its reservation through the hook", () => {
    mockedUseRestaurants.mockReturnValue({
      restaurants: [],
      loading: false,
      error: null,
    });

    render(<DiningView tripId="trip-1" tripStartDate="2026-04-10" />);

    fireEvent.click(screen.getByRole("button", { name: /add restaurant/i }));
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

  it("validates edit form and then saves edited reservation", () => {
    mockedUseRestaurants.mockReturnValue({
      restaurants: [baseRestaurant],
      loading: false,
      error: null,
    });
    getReservation.mockReturnValue(null);

    render(<DiningView tripId="trip-1" tripStartDate="2026-04-10" editable />);

    fireEvent.click(screen.getByRole("button", { name: "edit-rest-1" }));
    expect(screen.getByText("dining-edit-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "make-invalid" }));
    fireEvent.click(screen.getByRole("button", { name: "save-edit" }));
    expect(screen.getByText("Restaurant name is required.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "make-valid" }));
    fireEvent.click(screen.getByRole("button", { name: "save-edit" }));

    expect(upsertReservation).toHaveBeenCalledWith(
      "rest-1",
      expect.objectContaining({
        name: "Chris",
        partySize: 4,
        datetimeLocal: "2026-05-01T19:30",
      }),
    );
    expect(screen.getByText("Edited Bistro")).toBeInTheDocument();
  });

  it("deletes reservation card after confirm", () => {
    mockedUseRestaurants.mockReturnValue({
      restaurants: [baseRestaurant],
      loading: false,
      error: null,
    });
    getReservation.mockReturnValue({
      restaurantId: "rest-1",
      name: "Alex",
      partySize: 2,
      datetimeLocal: "2026-04-10T19:00",
      confirmationCode: "ABC123",
      notes: "window",
    });

    render(<DiningView tripId="trip-1" tripStartDate="2026-04-10" editable />);

    fireEvent.click(screen.getByRole("button", { name: "delete-rest-1" }));
    expect(screen.getByText(/Delete the reservation for "Le Gourmet"/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "confirm-delete" }));

    expect(removeReservation).toHaveBeenCalledWith("rest-1");
    expect(screen.getByText("No restaurants yet")).toBeInTheDocument();
  });
});
