/** @jest-environment node */
import { POST } from "../route";

describe("POST /api/ai/itinerary", () => {
  const originalFetch = global.fetch;
  const originalUrl = process.env.LLM_SERVICE_URL;
  const originalToken = process.env.LLM_SERVICE_TOKEN;

  const validBody = {
    tripId: "trip-1",
    trip: {
      titleOrDestination: "Toronto",
      startDate: "2026-08-01",
      endDate: "2026-08-05",
    },
  };

  beforeEach(() => {
    global.fetch = jest.fn();
    process.env.LLM_SERVICE_URL = "http://llm.local/itinerary";
    process.env.LLM_SERVICE_TOKEN = "secret-token";
  });

  afterAll(() => {
    global.fetch = originalFetch;
    process.env.LLM_SERVICE_URL = originalUrl;
    process.env.LLM_SERVICE_TOKEN = originalToken;
  });

  it("returns 400 when tripId is missing", async () => {
    const response = await POST(
      new Request("http://localhost/api/ai/itinerary", {
        method: "POST",
        body: JSON.stringify({ trip: validBody.trip }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "tripId is required" });
  });

  it("returns 400 when required trip fields are missing", async () => {
    const response = await POST(
      new Request("http://localhost/api/ai/itinerary", {
        method: "POST",
        body: JSON.stringify({
          tripId: "trip-1",
          trip: { titleOrDestination: "", startDate: "", endDate: "" },
        }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "trip.titleOrDestination, trip.startDate, and trip.endDate are required",
    });
  });

  it("returns 503 when llm service config is missing", async () => {
    process.env.LLM_SERVICE_URL = "";
    process.env.LLM_SERVICE_TOKEN = "";

    const response = await POST(
      new Request("http://localhost/api/ai/itinerary", {
        method: "POST",
        body: JSON.stringify(validBody),
      })
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "LLM service is not configured",
    });
  });

  it("forwards successful upstream response", async () => {
    const infoSpy = jest.spyOn(console, "info").mockImplementation(() => undefined);
    const mockedFetch = jest.mocked(global.fetch);
    mockedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ days: [{ date: "2026-08-01", items: [] }] }),
    } as Response);

    const response = await POST(
      new Request("http://localhost/api/ai/itinerary", {
        method: "POST",
        body: JSON.stringify(validBody),
      })
    );

    expect(response.status).toBe(200);
    expect(mockedFetch).toHaveBeenCalledWith(
      "http://llm.local/itinerary",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer secret-token",
        }),
      })
    );
    await expect(response.json()).resolves.toEqual({
      days: [{ date: "2026-08-01", items: [] }],
    });
    expect(infoSpy).toHaveBeenCalled();
    infoSpy.mockRestore();
  });

  it("maps upstream error payload when service fails", async () => {
    const mockedFetch = jest.mocked(global.fetch);
    mockedFetch.mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({ error: { detail: "upstream unavailable" } }),
    } as Response);

    const response = await POST(
      new Request("http://localhost/api/ai/itinerary", {
        method: "POST",
        body: JSON.stringify(validBody),
      })
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        error: "upstream unavailable",
        upstreamStatus: 502,
      })
    );
  });

  it("returns 500 on unexpected handler exceptions", async () => {
    const badRequest = { json: async () => {
      throw new Error("bad json");
    } } as unknown as Request;

    const response = await POST(badRequest);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Failed to process itinerary request",
    });
  });
});
