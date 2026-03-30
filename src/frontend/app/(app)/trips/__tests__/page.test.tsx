import { render, screen } from "@testing-library/react";
import TripsPage from "../page";
import { getTrips } from "@/features/trips/api";

jest.mock("@/features/trips/api", () => ({
  getTrips: jest.fn(),
}));

const mockedGetTrips = jest.mocked(getTrips);

describe("TripsPage", () => {
  beforeEach(() => {
    mockedGetTrips.mockReset();
  });

  it("renders empty state when no trips are returned", async () => {
    mockedGetTrips.mockResolvedValue([]);

    render(await TripsPage());

    expect(screen.getByText("Recent Trips")).toBeInTheDocument();
    expect(screen.getByText("No trips yet.")).toBeInTheDocument();
  });

  it("renders trip cards from api data", async () => {
    mockedGetTrips.mockResolvedValue([
      {
        id: "trip-1",
        titleOrDestination: "Seoul",
        startDate: "2026-09-01T00:00:00",
        endDate: "2026-09-05T00:00:00",
      },
    ]);

    render(await TripsPage());

    expect(screen.getByText("Seoul")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view trip/i })).toHaveAttribute(
      "href",
      "/trips/trip-1"
    );
    expect(screen.queryByText("Dates TBD")).not.toBeInTheDocument();
  });

  it("falls back to empty list when getTrips throws", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    mockedGetTrips.mockRejectedValue(new Error("boom"));

    render(await TripsPage());

    expect(screen.getByText("No trips yet.")).toBeInTheDocument();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
