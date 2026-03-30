import { act, renderHook, waitFor } from "@testing-library/react";
import { useReservations } from "../useReservations";
import { apiGet, apiPost, apiPut } from "@/lib/apiClient";
import type { DiningReservation } from "../../components/TripWorkspace";

jest.mock("@/lib/apiClient", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
}));

const mockedApiGet = jest.mocked(apiGet);
const mockedApiPost = jest.mocked(apiPost);
const mockedApiPut = jest.mocked(apiPut);

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const baseRestaurant: DiningReservation = {
  id: "trip-1-rest-1",
  name: "Le Gourmet",
  time: "2026-05-10T19:00:00Z",
  cuisine: "French",
  priceLevel: "HIGH",
  status: "pending",
  address: "Paris",
  notes: null,
  confirmationCode: null,
  partySize: 2,
  imageUrl: null,
};

describe("useReservations", () => {
  const originalMockFlag = process.env.NEXT_PUBLIC_USE_MOCK;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_USE_MOCK = "false";
    mockedApiGet.mockReset();
    mockedApiPost.mockReset();
    mockedApiPut.mockReset();
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_USE_MOCK = originalMockFlag;
  });

  it("loads reservations by matching backend ids to restaurant keys", async () => {
    const restaurants: DiningReservation[] = [baseRestaurant];
    const getRequest = deferred<
      Array<{
        id: string;
        name: string;
        partySize: number;
        time: string;
        confirmationCode: string;
        notes: string;
      }>
    >();
    mockedApiGet.mockReturnValue(getRequest.promise);

    const { result } = renderHook(() =>
      useReservations("trip-1", restaurants)
    );

    await act(async () => {
      getRequest.resolve([
        {
          id: "rest-1",
          name: "Taylor",
          partySize: 3,
          time: "2026-05-10T19:30:00Z",
          confirmationCode: "CONF-1",
          notes: "celebration",
        },
      ]);
      await Promise.resolve();
    });

    await waitFor(() =>
      expect(result.current.getReservation("trip-1-rest-1")).toEqual(
        expect.objectContaining({
          restaurantId: "trip-1-rest-1",
          name: "Taylor",
          partySize: 3,
          datetimeLocal: "2026-05-10T19:30:00Z",
          confirmationCode: "CONF-1",
        })
      )
    );

    expect(mockedApiGet).toHaveBeenCalledWith(
      "/api/trips/trip-1/dining-reservations"
    );
  });

  it("updates existing reservations with PUT and keeps local state synced", async () => {
    const restaurants: DiningReservation[] = [baseRestaurant];
    const getRequest = deferred<unknown[]>();
    mockedApiGet.mockReturnValue(getRequest.promise);
    mockedApiPut.mockResolvedValue({
      id: "rest-1",
      name: "Alex",
      partySize: 4,
      time: "2026-05-10T20:00:00.000Z",
      confirmationCode: "UPDATED",
      notes: "birthday",
    });

    const { result } = renderHook(() =>
      useReservations("trip-1", restaurants)
    );

    await act(async () => {
      getRequest.resolve([]);
      await Promise.resolve();
    });

    await waitFor(() => expect(mockedApiGet).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(result.current.reservations).toHaveProperty("trip-1-rest-1")
    );

    act(() => {
      result.current.upsertReservation("trip-1-rest-1", {
        restaurantId: "trip-1-rest-1",
        name: "Alex",
        partySize: 4,
        datetimeLocal: "2026-05-10T20:00",
        confirmationCode: "UPDATED",
        notes: "birthday",
      });
    });

    await waitFor(() =>
      expect(mockedApiPut).toHaveBeenCalledWith(
        "/api/trips/trip-1/dining-reservations/rest-1",
        expect.objectContaining({
          name: "Alex",
          priceTier: "TIER_3",
          status: "CONFIRMED",
          partySize: 4,
        })
      )
    );

    await waitFor(() =>
      expect(result.current.getReservation("trip-1-rest-1")).toEqual(
        expect.objectContaining({
          name: "Alex",
          confirmationCode: "UPDATED",
        })
      )
    );
  });

  it("creates new reservations with POST and supports removeReservation", async () => {
    const getRequest = deferred<unknown[]>();
    mockedApiGet.mockReturnValue(getRequest.promise);
    mockedApiPost.mockResolvedValue({
      id: "new-200",
      name: "Jordan",
      partySize: 2,
      time: "2026-06-01T18:00:00.000Z",
      confirmationCode: "NEW200",
      notes: "window",
    });

    const newRestaurant: DiningReservation = {
      ...baseRestaurant,
      id: "local-only",
      name: "Sushi Zen",
      priceLevel: "LOW",
    };
    const restaurants: DiningReservation[] = [newRestaurant];

    const { result } = renderHook(() =>
      useReservations("trip-1", restaurants)
    );

    await act(async () => {
      getRequest.resolve([]);
      await Promise.resolve();
    });

    await waitFor(() => expect(mockedApiGet).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(result.current.reservations).toHaveProperty("local-only")
    );

    act(() => {
      result.current.upsertReservation("local-only", {
        restaurantId: "local-only",
        name: "Jordan",
        partySize: 2,
        datetimeLocal: "2026-06-01T18:00",
        confirmationCode: "NEW200",
        notes: "window",
      });
    });

    await waitFor(() =>
      expect(mockedApiPost).toHaveBeenCalledWith(
        "/api/trips/trip-1/dining-reservations",
        expect.objectContaining({
          name: "Jordan",
          priceTier: "TIER_1",
          status: "CONFIRMED",
        })
      )
    );

    await waitFor(() =>
      expect(result.current.getReservation("local-only")).toEqual(
        expect.objectContaining({
          name: "Jordan",
          confirmationCode: "NEW200",
        })
      )
    );

    act(() => {
      result.current.removeReservation("local-only");
    });

    expect(result.current.getReservation("local-only")).toBeNull();
  });
});
