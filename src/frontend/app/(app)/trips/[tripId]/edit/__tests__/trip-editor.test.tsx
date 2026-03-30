import { render, screen } from "@testing-library/react";
import TripEditor from "../trip-editor";

jest.mock("@/features/trips/components/TripWorkspace", () => ({
  __esModule: true,
  default: ({
    tripId,
    editable,
  }: {
    tripId: string;
    editable: boolean;
  }) => <div>{`workspace-${tripId}-${editable ? "editable" : "readonly"}`}</div>,
}));

describe("TripEditor", () => {
  it("renders editable workspace and save/cancel links", () => {
    render(
      <TripEditor
        tripId="trip-44"
        trip={{
          id: "trip-44",
          titleOrDestination: "Berlin",
          startDate: "2026-11-01",
          endDate: "2026-11-03",
        }}
      />
    );

    expect(screen.getByText("workspace-trip-44-editable")).toBeInTheDocument();
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "/trips/trip-44");
    expect(links[1]).toHaveAttribute("href", "/trips/trip-44");
  });
});
