import { render, screen } from "@testing-library/react";
import EditTripPage from "../page";

jest.mock("../trip-editor", () => ({
  __esModule: true,
  default: (props: {
    tripId: string;
    trip?: { titleOrDestination: string };
    transportSegments: unknown[];
    accommodations: unknown[];
  }) => (
    <div>
      editor-{props.tripId}
      <div>{props.trip?.titleOrDestination ?? "no-trip"}</div>
      <div>segments-{props.transportSegments.length}</div>
      <div>accommodations-{props.accommodations.length}</div>
    </div>
  ),
}));

describe("EditTripPage", () => {
  const originalFetch = global.fetch;
  const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "http://mock-api";
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
    process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
  });

  it("loads trip, segments, and accommodations then renders editor", async () => {
    const mockedFetch = jest.mocked(global.fetch);
    mockedFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "trip-1", titleOrDestination: "Osaka" }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: "seg-1" }],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: "acc-1" }],
      } as Response);

    render(
      await EditTripPage({
        params: Promise.resolve({ tripId: "trip-1" }),
      })
    );

    expect(screen.getByText("editor-trip-1")).toBeInTheDocument();
    expect(screen.getByText("Osaka")).toBeInTheDocument();
    expect(screen.getByText("segments-1")).toBeInTheDocument();
    expect(screen.getByText("accommodations-1")).toBeInTheDocument();
  });

  it("falls back to null/empty values when fetches fail", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    const mockedFetch = jest.mocked(global.fetch);
    mockedFetch
      .mockRejectedValueOnce(new Error("trip failed"))
      .mockResolvedValueOnce({ ok: false } as Response)
      .mockResolvedValueOnce({ ok: false } as Response);

    render(
      await EditTripPage({
        params: Promise.resolve({ tripId: "trip-err" }),
      })
    );

    expect(screen.getByText("editor-trip-err")).toBeInTheDocument();
    expect(screen.getByText("no-trip")).toBeInTheDocument();
    expect(screen.getByText("segments-0")).toBeInTheDocument();
    expect(screen.getByText("accommodations-0")).toBeInTheDocument();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
