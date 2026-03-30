import { render, screen } from "@testing-library/react";
import TripDetailPage from "../page";
import {
  getAccommodations,
  getDiningReservations,
  getTransportSegments,
  getTrip,
} from "@/features/trips/api";

jest.mock("@/features/trips/api", () => ({
  getTrip: jest.fn(),
  getTransportSegments: jest.fn(),
  getDiningReservations: jest.fn(),
  getAccommodations: jest.fn(),
}));

jest.mock("../TripDetailClient", () => ({
  __esModule: true,
  default: (props: {
    tripId: string;
    trip?: { titleOrDestination: string };
    transportSegments: Array<{ mode: string }>;
    diningReservations: Array<{ priceLevel: string | null }>;
    accommodations: unknown[];
  }) => (
    <div>
      detail-client-{props.tripId}
      <div>{props.trip?.titleOrDestination ?? "no-trip"}</div>
      <div>segments-{props.transportSegments[0]?.mode ?? "none"}</div>
      <div>dining-{props.diningReservations[0]?.priceLevel ?? "none"}</div>
      <div>accommodations-{props.accommodations.length}</div>
    </div>
  ),
}));

const mockedGetTrip = jest.mocked(getTrip);
const mockedGetTransportSegments = jest.mocked(getTransportSegments);
const mockedGetDiningReservations = jest.mocked(getDiningReservations);
const mockedGetAccommodations = jest.mocked(getAccommodations);

describe("TripDetailPage", () => {
  beforeEach(() => {
    mockedGetTrip.mockReset();
    mockedGetTransportSegments.mockReset();
    mockedGetDiningReservations.mockReset();
    mockedGetAccommodations.mockReset();
  });

  it("maps api data and passes normalized props to TripDetailClient", async () => {
    mockedGetTrip.mockResolvedValue({
      id: "trip-1",
      titleOrDestination: "Tokyo",
      startDate: "2026-07-01",
      endDate: "2026-07-05",
    });
    mockedGetTransportSegments.mockResolvedValue([
      {
        id: "seg-1",
        type: "flight",
        title: "Outbound",
        completed: true,
      },
    ]);
    mockedGetDiningReservations.mockResolvedValue([
      {
        id: "res-1",
        name: "Bistro",
        priceTier: "$$",
      },
    ]);
    mockedGetAccommodations.mockResolvedValue([{ id: "stay-1", name: "Hotel" }]);

    render(
      await TripDetailPage({
        params: Promise.resolve({ tripId: "trip-1" }),
      })
    );

    expect(screen.getByText("detail-client-trip-1")).toBeInTheDocument();
    expect(screen.getByText("Tokyo")).toBeInTheDocument();
    expect(screen.getByText("segments-FLIGHT")).toBeInTheDocument();
    expect(screen.getByText("dining-MEDIUM")).toBeInTheDocument();
    expect(screen.getByText("accommodations-1")).toBeInTheDocument();
  });

  it("falls back to null/empty props when api calls fail", async () => {
    mockedGetTrip.mockRejectedValue(new Error("trip failed"));
    mockedGetTransportSegments.mockRejectedValue(new Error("segments failed"));
    mockedGetDiningReservations.mockRejectedValue(new Error("dining failed"));
    mockedGetAccommodations.mockRejectedValue(new Error("acc failed"));

    render(
      await TripDetailPage({
        params: Promise.resolve({ tripId: "trip-err" }),
      })
    );

    expect(screen.getByText("detail-client-trip-err")).toBeInTheDocument();
    expect(screen.getByText("no-trip")).toBeInTheDocument();
    expect(screen.getByText("segments-none")).toBeInTheDocument();
    expect(screen.getByText("dining-none")).toBeInTheDocument();
    expect(screen.getByText("accommodations-0")).toBeInTheDocument();
  });
});
