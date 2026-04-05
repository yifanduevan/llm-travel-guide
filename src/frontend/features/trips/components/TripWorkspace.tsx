"use client";

import { useMemo, useState } from "react";
import TabNavigation from "./TabNavigation";
import ItineraryView from "./ItineraryView";
import DiningView from "./DiningView";
import TransportationView from "@/features/trips/components/TransportationView";
import AccommodationsView from "./AccommodationsView";
import { ViewName } from "../types";
import type { TransportMode } from "../iconMap";
import type { PriceLevel } from "../utils/diningPrice";

type TripWorkspaceProps = {
  tripId: string;
  trip?: {
    id: string;
    titleOrDestination: string;
    startDate: string | null;
    endDate: string | null;
  };
  transportSegments?: TransportSegment[];
  diningReservations?: DiningReservation[];
  accommodations?: Accommodation[];
  editable?: boolean;
};

export type TransportSegment = {
  id: string;
  mode: TransportMode;
  type?: string | null;
  title: string;
  customModeName?: string;
  startTime: string | null;
  startTz?: string | null;
  startLocation: string | null;
  endTime: string | null;
  endTz?: string | null;
  endLocation: string | null;
  durationText: string | null;
  status: string;
  confirmationCode?: string | null;
  ticketsUrl?: string | null;
  ticketUrl?: string | null;
  notes?: string | null;
  completed: boolean;
};

export type DiningReservation = {
  id: string;
  name: string;
  time: string | null;
  cuisine: string | null;
  priceLevel: PriceLevel | null;
  status: string;
  address: string | null;
  notes: string | null;
  confirmationCode: string | null;
  partySize: number | null;
  imageUrl: string | null;
};

export type Accommodation = {
  id: string;
  name: string;
  address: string | null;
  roomType: string | null;
  checkIn: string | null;
  checkOut: string | null;
  rate: string | null;
  currency: string | null;
  status: string;
  confirmationCode: string | null;
  tags: string[] | null;
  imageUrl: string | null;
  notes: string | null;
};

export default function TripWorkspace({
  tripId,
  trip,
  transportSegments,
  accommodations,
  editable = false,
}: TripWorkspaceProps) {
  const [currentView, setCurrentView] = useState<ViewName>("itinerary");
  const isEditable = editable;

  const heading = trip?.titleOrDestination && trip.titleOrDestination.trim() !== "" ? trip.titleOrDestination : tripId;
  const formatLocalDate = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US");
  };
  const dateRange =
    trip?.startDate && trip?.endDate
      ? `${formatLocalDate(trip.startDate)} - ${formatLocalDate(trip.endDate)}`
      : null;

  const viewContent = useMemo(() => {
    switch (currentView) {
      case "itinerary":
        return <ItineraryView editable={isEditable} trip={trip} tripId={tripId} />;
      case "dining":
        return (
          <DiningView
            tripId={tripId}
            tripStartDate={trip?.startDate ?? null}
            editable={isEditable}
          />
        );
      case "transportation":
        return (
          <TransportationView
            tripId={tripId}
            segments={transportSegments}
            editable={isEditable}
          />
        );
      case "accommodation":
        return (
          <AccommodationsView
            trip={trip}
            tripId={tripId}
            accommodations={accommodations}
            editable={isEditable}
          />
        );
      default:
        return (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 capitalize">
              {currentView}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {isEditable
                ? "Editing enabled — wire up fields for this section."
                : "Viewing only — click Edit to make changes."}
            </p>
            <div className="mt-4 text-sm text-slate-500">
              Placeholder content for {currentView}.
            </div>
          </div>
        );
    }
  }, [
    currentView,
    isEditable,
    trip,
    tripId,
    transportSegments,
    accommodations,
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase text-black">
          {isEditable ? "Edit trip" : "Trip view"}
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          {heading}
        </h1>
        <div className="text-slate-600 space-y-1">
          {dateRange && <p className="text-sm">{dateRange}</p>}
          <p className="text-sm">
            Switch tabs to manage itinerary, dining, transportation, stays, and
            trip details.
          </p>
        </div>
        {isEditable && (
          <p className="inline-flex w-fit rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
            Editing mode
          </p>
        )}
      </div>

      <TabNavigation currentView={currentView} onViewChange={setCurrentView} />
      {viewContent}
    </div>
  );
}
