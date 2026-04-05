import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AccommodationsView from "../AccommodationsView";
import { getAccommodations } from "@/features/trips/api";

jest.mock("@/features/trips/api", () => ({
  getAccommodations: jest.fn(),
}));

describe("AccommodationsView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = jest.fn() as unknown as typeof fetch;
  });

  it("loads accommodations from API", async () => {
    (getAccommodations as jest.Mock).mockResolvedValue([
      {
        id: "stay-api-1",
        name: "API Hotel",
        address: "123 API St",
        roomType: "Suite",
        checkIn: "2026-11-10",
        checkOut: "2026-11-12",
        rate: "250",
        currency: "USD",
        status: "CONFIRMED",
        confirmationCode: "AP1",
        tags: ["Wi-Fi"],
        imageUrl: null,
        notes: null,
      },
    ]);

    render(<AccommodationsView tripId="trip-stay-1" />);

    expect(screen.getByText("Loading accommodations...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("API Hotel")).toBeInTheDocument();
    });

    expect(getAccommodations).toHaveBeenCalledWith("trip-stay-1");
    expect(screen.getByText("Nights total")).toBeInTheDocument();
  });

  it("adds a stay via form submit", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "stay-new-1",
        name: "New Stay",
        address: "45 King St",
        roomType: "Suite",
        checkIn: "2026-12-01",
        checkOut: "2026-12-03",
        rate: "280",
        currency: "USD",
        status: "CONFIRMED",
        confirmationCode: "NEW1",
        tags: ["Wi-Fi"],
        imageUrl: null,
        notes: "late check-in",
      }),
    });

    render(
      <AccommodationsView
        tripId="trip-stay-2"
        accommodations={[
          {
            id: "stay-base",
            name: "Base Stay",
            address: "Old Town",
            roomType: "Standard",
            checkIn: "2026-11-01",
            checkOut: "2026-11-02",
            rate: "120",
            currency: "USD",
            status: "CONFIRMED",
            confirmationCode: "BASE",
            tags: null,
            imageUrl: null,
            notes: null,
          },
        ]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /add stay/i }));
    fireEvent.change(screen.getByPlaceholderText("Hotel name"), {
      target: { value: "New Stay" },
    });
    fireEvent.change(screen.getByPlaceholderText("123 Main St, City"), {
      target: { value: "45 King St" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save stay/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "New Stay" })).toBeInTheDocument();
    });

    expect(globalThis.fetch).toHaveBeenCalled();
  });

  it("deletes a stay from list view after confirmation", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => "",
    });

    render(
      <AccommodationsView
        tripId="trip-stay-3"
        accommodations={[
          {
            id: "stay-del-1",
            name: "Delete Stay",
            address: "Delete St",
            roomType: "Standard",
            checkIn: "2026-11-01",
            checkOut: "2026-11-03",
            rate: "150",
            currency: "USD",
            status: "CONFIRMED",
            confirmationCode: "DEL1",
            tags: ["Wi-Fi"],
            imageUrl: null,
            notes: null,
          },
        ]}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: /format_list_bulleted/i })
    );
    fireEvent.click(
      screen.getByRole("button", { name: "delete" })
    );
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(screen.queryByText("Delete Stay")).not.toBeInTheDocument();
    });

    expect(globalThis.fetch).toHaveBeenCalled();
  });
});
