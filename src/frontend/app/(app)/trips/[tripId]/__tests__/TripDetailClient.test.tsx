import { fireEvent, render, screen } from "@testing-library/react";
import TripDetailClient from "../TripDetailClient";

jest.mock("@/features/trips/components/TripWorkspace", () => ({
  __esModule: true,
  default: ({
    tripId,
    editable,
  }: {
    tripId: string;
    editable: boolean;
  }) => <div>{`workspace-${tripId}-${editable ? "edit" : "view"}`}</div>,
}));

describe("TripDetailClient", () => {
  it("toggles editing mode and renders navigation actions", () => {
    render(
      <TripDetailClient
        tripId="trip-9"
        trip={{
          id: "trip-9",
          titleOrDestination: "Kyoto",
          startDate: "2026-05-01",
          endDate: "2026-05-05",
        }}
        transportSegments={[]}
        diningReservations={[]}
        accommodations={[]}
      />
    );

    expect(screen.getByText("workspace-trip-9-view")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to trips/i })).toHaveAttribute(
      "href",
      "/trips"
    );

    fireEvent.click(screen.getByRole("button", { name: /edit trip/i }));
    expect(screen.getByText("workspace-trip-9-edit")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /done editing/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.getByText("workspace-trip-9-view")).toBeInTheDocument();
  });
});
