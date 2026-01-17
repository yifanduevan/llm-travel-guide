"use client";

export default function DiningView() {
  return (
    <div className="flex flex-col gap-10 lg:flex-row">
      <div className="flex-1">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">
              Gastronomy
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Curated dining reservations for your Paris trip
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
              <span className="material-symbols-outlined text-lg">add</span>
              Add reservation
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2">
          {cards.map((card) => (
            <div
              key={card.title}
              className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-300 hover:shadow-xl"
            >
              <div className="relative h-56 w-full overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url('${card.image}')` }}
                />
                <div
                  className={`absolute right-4 top-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm ${
                    card.badgeTone === "accent"
                      ? "bg-red-50 text-red-500"
                      : "bg-white/90 text-slate-900"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      card.badgeTone === "accent" ? "bg-red-500" : "bg-slate-900"
                    }`}
                  />
                  {card.badge}
                </div>
              </div>
              <div className="p-6">
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="text-xl font-semibold text-slate-900">
                    {card.title}
                  </h3>
                  <span className="text-sm font-medium text-slate-600">
                    {card.price}
                  </span>
                </div>
                <div className="mb-4 flex flex-wrap gap-4 text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">
                      schedule
                    </span>
                    {card.time}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">
                      restaurant_menu
                    </span>
                    {card.cuisine}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-tight text-slate-900">
                    Notes
                  </label>
                  <textarea
                    className="h-12 w-full resize-none bg-transparent p-0 text-sm text-slate-700 outline-none focus:ring-0"
                    defaultValue={card.note}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="w-full shrink-0 lg:w-80">
        <div className="sticky top-28 space-y-6">
          <div className="space-y-4 rounded-2xl border border-transparent bg-slate-100 p-6">
            <h4 className="text-lg font-semibold text-slate-900">Quick stats</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-white/50 p-3">
                <div className="flex items-center gap-3 text-slate-700">
                  <span className="material-symbols-outlined text-slate-900">
                    book_online
                  </span>
                  <span className="text-sm font-medium">Total bookings</span>
                </div>
                <span className="font-bold text-slate-900">8</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/50 p-3">
                <div className="flex items-center gap-3 text-slate-700">
                  <span className="material-symbols-outlined text-slate-900">
                    verified
                  </span>
                  <span className="text-sm font-medium">Confirmed</span>
                </div>
                <span className="font-bold text-slate-900">6</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

const cards = [
  {
    title: "La Boheme Bistro",
    price: "$$$",
    time: "8:30 PM",
    cuisine: "French Contemporary",
    badge: "Confirmed",
    badgeTone: "default" as const,
    image:
      "https://images.unsplash.com/photo-1544145945-f90425340c7b?auto=format&fit=crop&w=600&q=80",
    note:
      "Ask for the corner table near the window. Great for local natural wine pairings.",
  },
  {
    title: "Sushi Zen",
    price: "$$$$",
    time: "7:00 PM",
    cuisine: "Japanese Omakase",
    badge: "Waitlisted",
    badgeTone: "accent" as const,
    image:
      "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=600&q=80",
    note:
      "Waitlist priority for 15th anniversary celebration. Mention Mr. Saito.",
  },
  {
    title: "Osteria Roma",
    price: "$$",
    time: "9:00 PM",
    cuisine: "Italian Traditional",
    badge: "Confirmed",
    badgeTone: "default" as const,
    image:
      "https://images.unsplash.com/photo-1528838064774-1c7b4d74d0dd?auto=format&fit=crop&w=600&q=80",
    note:
      "Authentic carbonara. Highly recommended by local concierge.",
  },
  {
    title: "The Green Kitchen",
    price: "$$$",
    time: "1:30 PM",
    cuisine: "Farm-to-Table",
    badge: "Confirmed",
    badgeTone: "default" as const,
    image:
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=600&q=80",
    note: "Vegetarian friendly garden with stunning lunch views.",
  },
];
