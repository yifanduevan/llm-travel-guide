import Link from "next/link";

export default function LandingPage() {
  return (
    <section className="flex flex-col gap-10">
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase text-slate-500">
          Trip Planner
        </p>
        <h1 className="text-4xl font-semibold text-slate-900">
          Organize your next trip.
        </h1>
        <p className="max-w-xl text-lg text-slate-500">
          Start by signing in to manage itineraries, add new trips, and keep
          plans in sync.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 shadow-sm btn-primary">
          Go to login
        </Link>
      </div>
    </section>
  );
}
