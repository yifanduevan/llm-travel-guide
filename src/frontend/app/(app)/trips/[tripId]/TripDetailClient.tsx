"use client";

import Link from "next/link";
import { useState } from "react";
import TripWorkspace, {
  type Accommodation,
  type DiningReservation,
  type TransportSegment,
} from "@/features/trips/components/TripWorkspace";

type TripDetailClientProps = {
  tripId: string;
  trip?: {
    id: string;
    titleOrDestination: string;
    startDate: string | null;
    endDate: string | null;
  };
  transportSegments: TransportSegment[];
  diningReservations: DiningReservation[];
  accommodations: Accommodation[];
};

export default function TripDetailClient({
  tripId,
  trip,
  transportSegments,
  diningReservations,
  accommodations,
}: TripDetailClientProps) {
  const [isEditing, setIsEditing] = useState(false);

  const enterEditingMode = () => setIsEditing(true);
  const exitEditingMode = () => setIsEditing(false);

  return (
    <div className="space-y-6">
      <TripWorkspace
        tripId={tripId}
        trip={trip}
        transportSegments={transportSegments}
        diningReservations={diningReservations}
        accommodations={accommodations}
        editable={isEditing}
      />

      <div className="flex gap-3">
        <button
          type="button"
          onClick={isEditing ? exitEditingMode : enterEditingMode}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 shadow-sm btn-primary"
        >
          {isEditing ? "Done editing" : "Edit trip"}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={exitEditingMode}
            className="rounded-lg border border-slate-400 px-4 py-2 transition hover:border-slate-900 hover:bg-slate-50"
            style={{ color: "#5e5e5e" }}
          >
            Cancel
          </button>
        )}

        <Link
          href="/trips"
          className="rounded-lg border border-slate-400 px-4 py-2 transition hover:border-slate-900 hover:bg-slate-50"
          style={{ color: "#5e5e5e" }}
        >
          Back to trips
        </Link>
      </div>
    </div>
  );
}