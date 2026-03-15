import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ItineraryView from "../ItineraryView";
import { getItinerary } from "@/features/trips/api";

jest.mock("@/features/trips/api", () => ({
  getItinerary: jest.fn(),
}));

const mockedGetItinerary = jest.mocked(getItinerary);

describe("ItineraryView", () => {
  beforeEach(() => {
    mockedGetItinerary.mockReset();
  });

  it("loads and renders itinerary days for the trip", async () => {
    mockedGetItinerary.mockResolvedValue([
      {
        label: "Day 1",
        date: "Friday, Apr 4",
        active: true,
        items: [
          {
            icon: "flight",
            title: "Flight to Tokyo",
            time: "9:00 AM",
            note: "Direct flight",
          },
        ],
      },
    ]);

    render(
      <ItineraryView
        tripId="trip-1"
        trip={{ id: "trip-1", startDate: "2026-04-04", endDate: "2026-04-10" }}
      />,
    );

    expect(mockedGetItinerary).toHaveBeenCalledWith("trip-1");
    expect(await screen.findByText("Day 1")).toBeInTheDocument();
    expect(screen.getByText("Flight to Tokyo")).toBeInTheDocument();
    expect(screen.getByText("Direct flight")).toBeInTheDocument();
  });

  it("shows empty state when there is no itinerary", async () => {
    mockedGetItinerary.mockResolvedValue([]);

    render(<ItineraryView tripId="trip-2" />);

    expect(await screen.findByText("No itinerary yet.")).toBeInTheDocument();
  });

  it("shows an error and retries loading when retry is clicked", async () => {
    mockedGetItinerary
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce([
        {
          label: "Day 2",
          date: "Saturday, Apr 5",
          active: false,
          items: [
            {
              icon: "restaurant",
              title: "Sushi dinner",
              time: "7:00 PM",
              note: "Reservation confirmed",
            },
          ],
        },
      ]);

    render(<ItineraryView tripId="trip-3" />);

    expect(await screen.findByText("Unable to load itinerary. Please try again.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => expect(mockedGetItinerary).toHaveBeenCalledTimes(2));
    expect(await screen.findByText("Sushi dinner")).toBeInTheDocument();
  });
});
