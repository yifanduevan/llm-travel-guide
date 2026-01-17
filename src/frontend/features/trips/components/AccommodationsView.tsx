"use client";

export default function AccommodationsView() {
  return (
    <div className="flex flex-col gap-10 lg:flex-row">
      <div className="flex-1">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">
              Stays & Havens
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Manage your accommodations for the upcoming trip
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button className="flex items-center justify-center rounded-lg bg-white p-2 text-slate-900 shadow-sm">
                <span className="material-symbols-outlined text-lg">
                  grid_view
                </span>
              </button>
              <button className="ml-1 flex items-center justify-center rounded-lg p-2 text-slate-500 transition hover:bg-white/70">
                <span className="material-symbols-outlined text-lg">
                  format_list_bulleted
                </span>
              </button>
            </div>
            <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
              <span className="material-symbols-outlined text-lg">
                add_business
              </span>
              Add stay
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {stays.map((stay) => (
            <div
              key={stay.title}
              className={`group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-300 hover:shadow-xl md:flex-row ${
                stay.status === "pending" ? "opacity-80 grayscale-[0.3]" : ""
              }`}
            >
              <div className="relative h-64 w-full shrink-0 overflow-hidden md:h-auto md:w-72">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url('${stay.image}')` }}
                />
                <div
                  className={`absolute left-4 top-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm ${
                    stay.status === "pending"
                      ? "border border-red-200/50 bg-red-100/40 text-red-500"
                      : "border border-slate-100 bg-white/95 text-slate-900"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      stay.status === "pending" ? "bg-red-500" : "bg-slate-900"
                    }`}
                  />
                  {stay.status === "pending" ? "Pending" : "Confirmed"}
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-semibold text-slate-900">
                        {stay.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                        <span className="material-symbols-outlined text-base">
                          location_on
                        </span>
                        {stay.address}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold uppercase tracking-tight text-slate-700">
                        {stay.roomType}
                      </div>
                      <div className="mt-0.5 text-xl font-semibold text-slate-900">
                        {stay.rate}
                        <span className="text-xs font-medium text-slate-600">
                          /night
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">
                        Check-in
                      </p>
                      <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        <span className="material-symbols-outlined text-lg text-slate-900">
                          calendar_today
                        </span>
                        {stay.checkIn}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">
                        Check-out
                      </p>
                      <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        <span className="material-symbols-outlined text-lg text-slate-900">
                          event_busy
                        </span>
                        {stay.checkOut}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6 flex flex-wrap gap-2">
                    {stay.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-800"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {tagIcons[tag] || "check"}
                        </span>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    {stay.status === "pending" ? (
                      <span className="font-semibold text-red-500">
                        Awaiting final confirmation
                      </span>
                    ) : (
                      <>
                        <span>Confirmation No:</span>
                        <span className="font-mono font-bold tracking-wider text-slate-900">
                          {stay.confirmation}
                        </span>
                      </>
                    )}
                  </div>
                  {stay.status === "pending" ? (
                    <button className="rounded-lg bg-slate-900/10 px-4 py-1.5 text-xs font-bold text-slate-900 transition hover:bg-slate-900/15">
                      Send reminder
                    </button>
                  ) : (
                    <button className="flex items-center gap-1 text-sm font-bold text-slate-900 underline-offset-4 hover:underline">
                      View booking details
                      <span className="material-symbols-outlined text-sm">
                        arrow_forward
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="w-full shrink-0 lg:w-80">
        <div className="sticky top-28 space-y-6">
          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h4 className="text-sm font-semibold text-slate-900">
                Stay map view
              </h4>
              <span className="material-symbols-outlined text-lg text-slate-900">
                map
              </span>
            </div>
            <div className="relative h-48 w-full bg-slate-100">
              <div className="absolute top-1/4 left-1/3 cursor-pointer text-slate-900">
                <span className="material-symbols-outlined text-3xl">
                  location_on
                </span>
                <div className="absolute -left-4 -top-6 rounded bg-white px-2 py-1 text-[10px] font-bold shadow">
                  The Luminary
                </div>
              </div>
              <div className="absolute bottom-1/3 right-1/4 cursor-pointer text-red-400">
                <span className="material-symbols-outlined text-3xl">
                  location_on
                </span>
                <div className="absolute -left-6 -top-6 rounded bg-white px-2 py-1 text-[10px] font-bold shadow">
                  Rive Gauche
                </div>
              </div>
            </div>
            <div className="bg-slate-900/5 p-4">
              <button className="w-full rounded-lg border border-slate-200 bg-white py-2 text-xs font-bold text-slate-800 transition hover:border-slate-300">
                Expand full map
              </button>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-transparent bg-slate-100 p-6">
            <h4 className="text-lg font-semibold text-slate-900">
              Itinerary summary
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-white/50 p-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-900">
                    bedtime
                  </span>
                  <span className="text-sm font-medium text-slate-800">
                    Nights total
                  </span>
                </div>
                <span className="font-bold text-slate-900">6 Nights</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/50 p-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-900">
                    apartment
                  </span>
                  <span className="text-sm font-medium text-slate-800">
                    Stay types
                  </span>
                </div>
                <span className="font-bold text-slate-900">2 Hotels</span>
              </div>
              <div className="border-t border-slate-200 pt-4">
                <div className="mb-2 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Est. accommodation cost
                    </p>
                    <p className="text-2xl font-semibold text-slate-900">
                      $2,190
                    </p>
                  </div>
                  <span className="mb-1 rounded-md bg-slate-900/10 px-2 py-1 text-[10px] font-bold uppercase text-slate-900">
                    Tax included
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-[85%] bg-slate-900" />
                </div>
                <p className="mt-2 text-right text-[10px] font-medium text-slate-600">
                  38% of total trip budget
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

const stays = [
  {
    title: "The Luminary Hotel",
    status: "confirmed" as const,
    address: "12 Rue de Rivoli, Paris, 75004",
    roomType: "Premier Suite",
    rate: "$450",
    checkIn: "Oct 12, 2024",
    checkOut: "Oct 15, 2024",
    confirmation: "#FR-88219-X",
    image:
      "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=800&q=80",
    tags: ["Wi-Fi", "Infinity Pool", "Spa", "Valet"],
  },
  {
    title: "Rive Gauche Boutique Stay",
    status: "pending" as const,
    address: "24 Blvd Saint-Germain, Paris",
    roomType: "Deluxe Queen",
    rate: "$280",
    checkIn: "Oct 15, 2024",
    checkOut: "Oct 18, 2024",
    confirmation: "#FR-77882",
    image:
      "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=80",
    tags: ["Breakfast Inc.", "Gym"],
  },
];

const tagIcons: Record<string, string> = {
  "Wi-Fi": "wifi",
  "Infinity Pool": "pool",
  Spa: "spa",
  Valet: "parking_valet",
  "Breakfast Inc.": "breakfast_dining",
  Gym: "fitness_center",
};
