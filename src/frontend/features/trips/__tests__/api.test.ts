import {
  createTrip,
  generateItinerary,
  getAccommodations,
  getDiningReservations,
  getItinerary,
  getTransportSegments,
  getTrip,
  getTrips,
} from "../api";
import { apiGet, apiPost } from "@/lib/apiClient";

jest.mock("@/lib/apiClient", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  get USE_MOCK() {
    return process.env.NEXT_PUBLIC_USE_MOCK === "true";
  },
}));

const mockedApiGet = jest.mocked(apiGet);
const mockedApiPost = jest.mocked(apiPost);

describe("trips api", () => {
  const originalMockFlag = process.env.NEXT_PUBLIC_USE_MOCK;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_USE_MOCK = "false";
    mockedApiGet.mockReset();
    mockedApiPost.mockReset();
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_USE_MOCK = originalMockFlag;
  });

  it("delegates standard resource reads to apiGet in non-mock mode", async () => {
    mockedApiGet
      .mockResolvedValueOnce([{ id: "trip-1" }])
      .mockResolvedValueOnce({ id: "trip-2" })
      .mockResolvedValueOnce([{ id: "stay-1" }])
      .mockResolvedValueOnce([{ id: "dine-1" }])
      .mockResolvedValueOnce([{ id: "segment-1" }]);

    await expect(getTrips()).resolves.toEqual([{ id: "trip-1" }]);
    await expect(getTrip("trip-2")).resolves.toEqual({ id: "trip-2" });
    await expect(getAccommodations("trip-2")).resolves.toEqual([{ id: "stay-1" }]);
    await expect(getDiningReservations("trip-2")).resolves.toEqual([{ id: "dine-1" }]);
    await expect(getTransportSegments("trip-2")).resolves.toEqual([{ id: "segment-1" }]);

    expect(mockedApiGet).toHaveBeenNthCalledWith(1, "/api/trips");
    expect(mockedApiGet).toHaveBeenNthCalledWith(2, "/api/trips/trip-2");
    expect(mockedApiGet).toHaveBeenNthCalledWith(3, "/api/trips/trip-2/accommodations");
    expect(mockedApiGet).toHaveBeenNthCalledWith(
      4,
      "/api/trips/trip-2/dining-reservations"
    );
    expect(mockedApiGet).toHaveBeenNthCalledWith(
      5,
      "/api/trips/trip-2/transport-segments"
    );
  });

  it("creates trips with normalized payload in non-mock mode", async () => {
    mockedApiPost.mockResolvedValue({ id: "trip-100", titleOrDestination: "Paris" });

    const response = await createTrip({
      titleOrDestination: "Paris",
      startDate: "2026-08-01",
      endDate: "2026-08-05",
      travelers: "COUPLE",
      budget: "MEDIUM",
      notes: null,
    });

    expect(response).toEqual({ id: "trip-100", titleOrDestination: "Paris" });
    expect(mockedApiPost).toHaveBeenCalledWith(
      "/api/trips",
      expect.objectContaining({
        titleOrDestination: "Paris",
        startDate: "2026-08-01",
        endDate: "2026-08-05",
        travelers: "COUPLE",
        budget: "MEDIUM",
        status: "DRAFT",
      }),
      { signal: undefined }
    );
  });

  it("supports mock createTrip branch and abort behavior", async () => {
    process.env.NEXT_PUBLIC_USE_MOCK = "true";

    const created = await createTrip({
      titleOrDestination: "Rome",
      startDate: null,
      endDate: null,
      travelers: "SOLO",
      budget: "BUDGET",
    });
    expect(created).toEqual(
      expect.objectContaining({
        titleOrDestination: "Rome",
        status: "DRAFT",
      })
    );

    const controller = new AbortController();
    controller.abort();
    await expect(
      createTrip(
        {
          titleOrDestination: "Aborted",
          startDate: null,
          endDate: null,
          travelers: "SOLO",
          budget: "BUDGET",
        },
        { signal: controller.signal }
      )
    ).rejects.toThrow("Aborted");
  });

  it("maps itinerary payload from /itinerary endpoint when available", async () => {
    mockedApiGet.mockResolvedValue([
      {
        label: "Day One",
        date: "2026-06-01",
        active: true,
        items: [{ title: "Museum", icon: "museum", time: "10:00", note: "Visit" }],
      },
    ]);

    const itinerary = await getItinerary("trip-1");

    expect(mockedApiGet).toHaveBeenCalledWith("/api/trips/trip-1/itinerary");
    expect(itinerary).toHaveLength(1);
    expect(itinerary[0]).toEqual(
      expect.objectContaining({
        label: "Day One",
        date: "2026-06-01",
        active: true,
      })
    );
    expect(itinerary[0].items[0]).toEqual(
      expect.objectContaining({
        title: "Museum",
        icon: "museum",
      })
    );
  });

  it("falls back to related endpoints when itinerary endpoint fails", async () => {
    mockedApiGet.mockImplementation(async (path: string) => {
      if (path.endsWith("/itinerary")) {
        throw new Error("itinerary endpoint unavailable");
      }
      if (path.endsWith("/transport-segments")) {
        return [
          {
            id: "seg-1",
            type: "FLIGHT",
            title: "Flight to NYC",
            startTime: "2026-06-01T13:00:00Z",
            startLocation: "Toronto",
            endLocation: "New York",
          },
        ];
      }
      if (path.endsWith("/accommodations")) {
        return [
          {
            id: "stay-1",
            name: "Hotel Midtown",
            checkIn: "2026-06-02",
            address: "7th Avenue",
          },
        ];
      }
      if (path.endsWith("/dining-reservations")) {
        return [
          {
            id: "dine-1",
            name: "Prime Grill",
            time: "2026-06-01T18:00:00Z",
            notes: "Steak dinner",
          },
        ];
      }
      return [];
    });

    const itinerary = await getItinerary("trip-fallback");

    expect(itinerary.length).toBeGreaterThanOrEqual(1);
    expect(itinerary[0].items.length).toBeGreaterThan(0);
    const allTitles = itinerary.flatMap((day) => day.items.map((item) => item.title));
    expect(allTitles).toEqual(
      expect.arrayContaining(["Flight to NYC", "Hotel Midtown", "Prime Grill"])
    );
    expect(
      itinerary.some((day) =>
        day.items.some((item) => item.title.includes("Flight") || item.title.includes("Prime"))
      )
    ).toBe(true);
  });

  it("maps generated itinerary day/items from LLM response", async () => {
    mockedApiPost.mockResolvedValue({
      days: [
        {
          date: "2026-06-03",
          items: [
            {
              title: "Central Park Walk",
              time: "09:00",
              description: "Morning walk",
              locationText: "Central Park",
            },
          ],
        },
      ],
    });

    const days = await generateItinerary("trip-2");

    expect(mockedApiPost).toHaveBeenCalledWith(
      "/api/trips/trip-2/generate-itinerary",
      undefined
    );
    expect(days).toHaveLength(1);
    expect(days[0]).toEqual(
      expect.objectContaining({
        label: "Day 1",
        active: true,
      })
    );
    expect(days[0].items[0]).toEqual(
      expect.objectContaining({
        icon: "local_activity",
        title: "Central Park Walk",
      })
    );
  });

  it("returns empty generated itinerary when response payload is invalid", async () => {
    mockedApiPost.mockResolvedValue({ days: null });

    await expect(generateItinerary("trip-empty")).resolves.toEqual([]);
  });
});
