import Link from "next/link";
import TripWorkspace from "@/features/trips/components/TripWorkspace";

type TripEditorProps = {
  tripId: string;
};

export default function TripEditor({ tripId }: TripEditorProps) {
  return (
    <div className="space-y-4">
      <TripWorkspace tripId={tripId} editable />
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
