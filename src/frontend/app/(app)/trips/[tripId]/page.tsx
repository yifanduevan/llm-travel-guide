import Link from "next/link";
import TripWorkspace from "@/features/trips/components/TripWorkspace";

type TripDetailPageProps = {
  params: Promise<{ tripId: string }>;
};

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const { tripId } = await params;

  return (
    <div className="space-y-6">
      <TripWorkspace tripId={tripId} />

      <div className="flex gap-3">
        <Link
          href={`/trips/${tripId}/edit`}
          className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800"
        >
          Edit trip
        </Link>
        <Link
          href="/trips"
          className="rounded-lg border border-slate-200 px-4 py-2 text-slate-800 transition hover:border-slate-300 hover:bg-white"
        >
          Back to trips
        </Link>
      </div>
    </div>
  );
}
