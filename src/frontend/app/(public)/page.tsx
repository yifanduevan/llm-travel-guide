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
        <p className="max-w-xl text-lg text-slate-600">
          Start by signing in to manage itineraries, add new trips, and keep
          plans in sync.
        </p>
        <Link
          href="/login"
          className="inline-flex w-fit items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-white shadow-sm transition hover:bg-slate-800"
        >
          Go to login
        </Link>
      </div>
    </section>
  );
}
