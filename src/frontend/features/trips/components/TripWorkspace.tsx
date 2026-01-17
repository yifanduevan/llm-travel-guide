"use client";

import { useMemo, useState } from "react";
import TabNavigation from "./TabNavigation";
import ItineraryView from "./ItineraryView";
import DiningView from "./DiningView";
import TransportationView from "./TransportationView";
import AccommodationsView from "./AccommodationsView";
import ActivitiesView from "./ActivitiesView";
import { ViewName } from "../types";

type TripWorkspaceProps = {
  tripId: string;
  editable?: boolean;
};

export default function TripWorkspace({
  tripId,
  editable = false,
}: TripWorkspaceProps) {
  const [currentView, setCurrentView] = useState<ViewName>("itinerary");

  const viewContent = useMemo(() => {
    switch (currentView) {
      case "itinerary":
        return <ItineraryView editable={editable} />;
      case "dining":
        return <DiningView />;
      case "transportation":
        return <TransportationView />;
      case "accommodation":
        return <AccommodationsView />;
      case "activities":
        return <ActivitiesView />;
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
        <p className="text-sm font-semibold uppercase text-slate-500">
          {editable ? "Edit trip" : "Trip view"}
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          {tripId} itinerary
        </h1>
        <p className="text-slate-600">
          Switch tabs to manage itinerary, dining, transportation, stays, and
          activities.
        </p>
      </div>

      <TabNavigation currentView={currentView} onViewChange={setCurrentView} />
      {viewContent}
    </div>
  );
}
