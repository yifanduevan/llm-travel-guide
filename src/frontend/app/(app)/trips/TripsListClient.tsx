"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ConfirmOverlay from "@/features/trips/components/ConfirmOverlay";
import { deleteTrip } from "@/features/trips/api";

type TripListItem = {
  id: string;
  titleOrDestination: string;
  startDate: string | null;
  endDate: string | null;
};

type TripsListClientProps = {
  initialTrips: TripListItem[];
};

function formatRange(startDate: string | null, endDate: string | null) {
  if (!startDate || !endDate) return "Dates TBD";
  const start = new Date(startDate);
  const end = new Date(endDate);
  const startFmt = start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const endFmt = end.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: start.getFullYear() === end.getFullYear() ? undefined : "numeric",
  });
  return `${startFmt} - ${endFmt}`;
}

export default function TripsListClient({ initialTrips }: TripsListClientProps) {
  const [trips, setTrips] = useState(initialTrips);
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const tripToDelete = useMemo(
    () => trips.find((trip) => trip.id === deletingTripId) ?? null,
    [trips, deletingTripId],
  );

  const onRequestDelete = (tripId: string) => {
    setErrorMessage(null);
    setDeletingTripId(tripId);
  };

  const onCancelDelete = () => {
    if (busy) return;
    setDeletingTripId(null);
  };

  const onConfirmDelete = async () => {
    if (!tripToDelete) return;
    setBusy(true);
    setErrorMessage(null);

    try {
      await deleteTrip(tripToDelete.id);
      setTrips((prev) => prev.filter((trip) => trip.id !== tripToDelete.id));
      setDeletingTripId(null);
    } catch {
      setErrorMessage("Unable to delete trip. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {trips.length === 0 ? (
          <p className="text-sm text-slate-600">No trips yet.</p>
        ) : (
          trips.map((trip) => (
            <article
              key={trip.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
            >
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-slate-900">
                  {trip.titleOrDestination}
                </h2>
                <p className="text-sm text-slate-600">
                  {formatRange(trip.startDate, trip.endDate)}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <Link
                  href={`/trips/${trip.id}`}
                  className="text-sm font-medium text-slate-700 underline underline-offset-4"
                >
                  View trip
                </Link>
                <button
                  type="button"
                  onClick={() => onRequestDelete(trip.id)}
                  className="rounded-md px-2.5 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <ConfirmOverlay
        open={tripToDelete !== null}
        title="Delete trip?"
        message={
          tripToDelete
            ? `This will permanently delete "${tripToDelete.titleOrDestination}" and all related itinerary, dining, transport, and accommodation data.`
            : ""
        }
        confirmLabel="Delete trip"
        cancelLabel="Keep trip"
        busy={busy}
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
      />
    </>
  );
}
