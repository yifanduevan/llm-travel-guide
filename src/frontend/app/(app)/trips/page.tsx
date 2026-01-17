import Link from "next/link";

const sampleTrips = [
  { id: "london-2024", name: "London", dateRange: "Mar 4 - Mar 11, 2024" },
  { id: "kyoto-2024", name: "Kyoto", dateRange: "May 18 - May 26, 2024" },
];

export default function TripsPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase text-slate-500">Trips</p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Recent Trips
        </h1>
        <p className="text-slate-600">
          Add, edit, and keep track of upcoming travel plans.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {sampleTrips.map((trip) => (
          <Link
            key={trip.id}
            href={`/trips/${trip.id}`}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
          >
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-slate-900">
                {trip.name}
              </h2>
              <p className="text-sm text-slate-600">{trip.dateRange}</p>
            </div>
            <p className="mt-3 text-sm font-medium text-slate-700 underline underline-offset-4">
              View trip
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
