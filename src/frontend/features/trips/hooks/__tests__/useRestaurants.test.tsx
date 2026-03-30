import { renderHook, waitFor } from "@testing-library/react";
import { useRestaurants } from "../useRestaurants";
import { getDiningReservations } from "@/features/trips/api";

jest.mock("@/features/trips/api", () => ({
  getDiningReservations: jest.fn(),
}));

const mockedGetDiningReservations = jest.mocked(getDiningReservations);

describe("useRestaurants", () => {
  beforeEach(() => {
    mockedGetDiningReservations.mockReset();
  });

  it("loads, scopes, and maps dining reservations from api", async () => {
    mockedGetDiningReservations.mockResolvedValue([
      {
        id: "abc",
        name: "Le Gourmet",
        time: "2026-06-01T19:00:00Z",
        cuisine: "French",
        priceTier: "$$",
        status: "confirmed",
        address: "Paris",
        notes: "window seat",
        confirmationCode: "CODE-1",
        partySize: 2,
        imageUrl: "https://img.example/1",
      },
      {
        name: undefined,
        address: undefined,
        time: undefined,
        priceTier: "UNKNOWN",
      },
    ]);

    const { result } = renderHook(() => useRestaurants("trip-22"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockedGetDiningReservations).toHaveBeenCalledWith("trip-22");
    expect(result.current.error).toBeNull();
    expect(result.current.restaurants).toHaveLength(2);

    expect(result.current.restaurants[0]).toEqual(
      expect.objectContaining({
        id: "trip-22-abc",
        name: "Le Gourmet",
        priceLevel: "MEDIUM",
        status: "confirmed",
      })
    );
    expect(result.current.restaurants[1].id).toMatch(
      /^trip-22-untitled-restaurant-/
    );
    expect(result.current.restaurants[1]).toEqual(
      expect.objectContaining({
        name: "Untitled restaurant",
        priceLevel: null,
        status: "pending",
      })
    );
  });

  it("surfaces a readable error when loading fails", async () => {
    mockedGetDiningReservations.mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useRestaurants("trip-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.restaurants).toEqual([]);
    expect(result.current.error).toBe("Unable to load dining reservations.");
  });
});
