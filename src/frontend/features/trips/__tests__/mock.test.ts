import {
  getMockItinerary,
  getMockReservationByRestaurantId,
  mockReservations,
} from "../mock";

describe("trip mock helpers", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns mock reservation asynchronously by key", async () => {
    const knownKey = Object.keys(mockReservations)[0];
    const promise = getMockReservationByRestaurantId(knownKey);

    jest.advanceTimersByTime(300);
    await expect(promise).resolves.toEqual(mockReservations[knownKey]);
  });

  it("returns null for missing reservation key", async () => {
    const promise = getMockReservationByRestaurantId("unknown-id");

    jest.advanceTimersByTime(300);
    await expect(promise).resolves.toBeNull();
  });

  it("validates itinerary trip id parsing and fallbacks", () => {
    expect(getMockItinerary(undefined)).toEqual([]);
    expect(getMockItinerary(null)).toEqual([]);
    expect(getMockItinerary("not-a-number")).toEqual([]);
    expect(getMockItinerary(999999)).toEqual([]);

    const trip2 = getMockItinerary(2);
    expect(trip2.length).toBeGreaterThan(0);
    expect(trip2[0]).toEqual(
      expect.objectContaining({
        label: expect.any(String),
        date: expect.any(String),
      })
    );
  });
});
