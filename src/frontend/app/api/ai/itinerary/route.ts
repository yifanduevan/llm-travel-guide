import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ItineraryRequestBody = {
  tripId?: string;
  trip?: {
    titleOrDestination?: string;
    startDate?: string;
    endDate?: string;
    travelers?: string;
    budget?: string;
    notes?: string | null;
  };
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ItineraryRequestBody;
    const tripId = body?.tripId?.trim();
    const trip = body?.trip;

    if (!tripId) {
      return NextResponse.json({ error: "tripId is required" }, { status: 400 });
    }

    if (!trip?.titleOrDestination?.trim() || !trip?.startDate?.trim() || !trip?.endDate?.trim()) {
      return NextResponse.json(
        { error: "trip.titleOrDestination, trip.startDate, and trip.endDate are required" },
        { status: 400 },
      );
    }

    const serviceUrl = process.env.LLM_SERVICE_URL;
    const serviceToken = process.env.LLM_SERVICE_TOKEN;

    if (!serviceUrl || !serviceToken) {
      return NextResponse.json({ error: "LLM service is not configured" }, { status: 503 });
    }

    console.info(`[api/ai/itinerary] proxy request for tripId=${tripId}`);

    const response = await fetch(serviceUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "LLM service failed" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to process itinerary request" }, { status: 500 });
  }
}
