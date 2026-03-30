import { fireEvent, render, screen } from "@testing-library/react";
import type { Accommodation, TransportSegment } from "../TripWorkspace";
import TripWorkspace from "../TripWorkspace";

jest.mock("../ItineraryView", () => ({
  __esModule: true,
  default: ({ tripId }: { tripId: string }) => <div>itinerary-view-{tripId}</div>,
}));

jest.mock("../DiningView", () => ({
  __esModule: true,
  default: ({
    tripId,
    tripStartDate,
  }: {
    tripId: string;
    tripStartDate: string | null;
  }) => <div>dining-view-{tripId}-{tripStartDate ?? "none"}</div>,
}));

jest.mock("@/features/trips/components/TransportationView", () => ({
  __esModule: true,
  default: ({ tripId, segments }: { tripId: string; segments?: TransportSegment[] }) => (
    <div>transport-view-{tripId}-{segments?.length ?? 0}</div>
  ),
}));

jest.mock("../AccommodationsView", () => ({
  __esModule: true,
  default: ({
    tripId,
    accommodations,
  }: {
    tripId: string;
    accommodations?: Accommodation[];
  }) => <div>accommodation-view-{tripId}-{accommodations?.length ?? 0}</div>,
}));

jest.mock("../TabNavigation", () => ({
  __esModule: true,
  default: ({
    onViewChange,
  }: {
    onViewChange: (
      view: "itinerary" | "dining" | "transportation" | "accommodation"
    ) => void;
  }) => (
    <div>
      <button onClick={() => onViewChange("itinerary")}>tab-itinerary</button>
      <button onClick={() => onViewChange("dining")}>tab-dining</button>
      <button onClick={() => onViewChange("transportation")}>tab-transportation</button>
      <button onClick={() => onViewChange("accommodation")}>tab-accommodation</button>
    </div>
  ),
}));

describe("TripWorkspace", () => {
  const trip = {
    id: "trip-1",
    titleOrDestination: "Tokyo Adventure",
    startDate: "2026-07-01",
    endDate: "2026-07-10",
  };

  it("renders heading/date range and itinerary view by default", () => {
    render(<TripWorkspace tripId="trip-1" trip={trip} />);

    expect(screen.getByText("Trip view")).toBeInTheDocument();
    expect(screen.getByText("Tokyo Adventure")).toBeInTheDocument();
    expect(
      screen.getByText(/\d{1,2}\/\d{1,2}\/\d{4} - \d{1,2}\/\d{1,2}\/\d{4}/)
    ).toBeInTheDocument();
    expect(screen.getByText("itinerary-view-trip-1")).toBeInTheDocument();
  });

  it("falls back to trip id as heading when title is blank", () => {
    render(
      <TripWorkspace
        tripId="trip-xyz"
        trip={{
          ...trip,
          titleOrDestination: "   ",
        }}
      />
    );

    expect(screen.getByText("trip-xyz")).toBeInTheDocument();
  });

  it("renders editable badges and switches between all tab views", () => {
    render(
      <TripWorkspace
        tripId="trip-1"
        trip={trip}
        editable
        transportSegments={[
          {
            id: "seg-1",
            mode: "TRAIN",
            title: "Metro",
            startTime: null,
            startLocation: null,
            endTime: null,
            endLocation: null,
            durationText: null,
            status: "planned",
            completed: false,
          },
        ]}
        accommodations={[
          {
            id: "stay-1",
            name: "Shinjuku Hotel",
            address: "Tokyo",
            roomType: "Double",
            checkIn: null,
            checkOut: null,
            rate: null,
            currency: null,
            status: "confirmed",
            confirmationCode: null,
            tags: null,
            imageUrl: null,
            notes: null,
          },
        ]}
      />
    );

    expect(screen.getByText("Edit trip")).toBeInTheDocument();
    expect(screen.getByText("Editing mode")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "tab-dining" }));
    expect(screen.getByText("dining-view-trip-1-2026-07-01")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "tab-transportation" }));
    expect(screen.getByText("transport-view-trip-1-1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "tab-accommodation" }));
    expect(screen.getByText("accommodation-view-trip-1-1")).toBeInTheDocument();
  });
});
