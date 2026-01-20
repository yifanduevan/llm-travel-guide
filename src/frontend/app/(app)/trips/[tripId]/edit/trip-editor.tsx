import Link from "next/link";
import TripWorkspace from "@/features/trips/components/TripWorkspace";

type TripEditorProps = {
  tripId: string;
  trip?: {
    id: string;
    titleOrDestination: string;
    startDate: string | null;
    endDate: string | null;
  };
  transportSegments?: import("@/features/trips/components/TripWorkspace").TransportSegment[];
};

export default function TripEditor({
  tripId,
  trip,
  transportSegments,
}: TripEditorProps) {
  return (
    <div className="space-y-4">
      <TripWorkspace
        tripId={tripId}
        trip={trip}
        transportSegments={transportSegments}
        editable
      />
      <div className="flex gap-3">
        <Link
          href={`/trips/${tripId}`}
          className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800"
        >
          Save changes
        </Link>
        <Link
          href={`/trips/${tripId}`}
          className="rounded-lg border border-slate-200 px-4 py-2 text-slate-800 transition hover:border-slate-300 hover:bg-white"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}
