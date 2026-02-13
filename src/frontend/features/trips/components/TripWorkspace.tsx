"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import TabNavigation from "./TabNavigation";
import ItineraryView from "./ItineraryView";
import DiningView from "./DiningView";
import TransportationView from "./TransportationView";
import AccommodationsView from "./AccommodationsView";
import ActivitiesView from "./ActivitiesView";
import { ViewName } from "../types";

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
  type: string;
  title: string;
  startTime: string | null;
  startLocation: string | null;
  endTime: string | null;
  endLocation: string | null;
  durationText: string | null;
  status: string;
  confirmationCode: string | null;
  ticketUrl: string | null;
  completed: boolean;
};

export type DiningReservation = {
  id: string;
  name: string;
  time: string | null;
  cuisine: string | null;
  priceTier: string | null;
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
  diningReservations,
  accommodations,
  editable = false,
}: TripWorkspaceProps) {
  const [currentView, setCurrentView] = useState<ViewName>("itinerary");
  const searchParams = useSearchParams();
  const urlEdit = searchParams?.get("edit") === "true";

  const isEditable = editable || urlEdit;

  const heading = trip?.titleOrDestination && trip.titleOrDestination.trim() !== "" ? trip.titleOrDestination : tripId;
  const dateRange =
    trip?.startDate && trip?.endDate
      ? `${new Date(trip.startDate).toLocaleDateString()} - ${new Date(
            trip.endDate,
          ).toLocaleDateString()}`
      : null;

  const viewContent = useMemo(() => {
    switch (currentView) {
      case "itinerary":
        return <ItineraryView editable={isEditable} trip={trip} />;
      case "dining":
        return (
          <DiningView
            trip={trip}
            tripId={tripId}
            reservations={diningReservations}
          />
        );
      case "transportation":
        return (
          <TransportationView trip={trip} segments={transportSegments} />
        );
      case "accommodation":
        return (
          <AccommodationsView
            trip={trip}
            tripId={tripId}
            accommodations={accommodations}
          />
        );
      case "activities":
        return <ActivitiesView trip={trip} tripId={tripId} />;
      default:
        return (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 capitalize">
              {currentView}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {editable
                ? "Editing enabled — wire up fields for this section."
                : "Viewing only — click Edit to make changes."}
            </p>
            <div className="mt-4 text-sm text-slate-500">
              Placeholder content for {currentView}.
            </div>
          </div>
        );
    }
  }, [currentView, editable]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase text-black">
          {editable ? "Edit trip" : "Trip view"}
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          {heading}
        </h1>
        <div className="text-slate-600 space-y-1">
          {dateRange && <p className="text-sm">{dateRange}</p>}
          <p className="text-sm">
            Switch tabs to manage itinerary, dining, transportation, stays, and
            activities.
          </p>
        </div>
      </div>

      <TabNavigation currentView={currentView} onViewChange={setCurrentView} />
      {viewContent}
    </div>
  );
}
