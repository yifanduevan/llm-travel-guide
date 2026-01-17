"use client";

type ItineraryItem = {
  icon: string;
  title: string;
  time: string;
  note: string;
  image?: string;
  muted?: boolean;
};

type ItineraryDay = {
  label: string;
  date: string;
  active?: boolean;
  items: ItineraryItem[];
};

type ItineraryViewProps = {
  editable?: boolean;
};

const days: ItineraryDay[] = [
  {
    label: "Day 1: Arrival & Settlement",
    date: "Saturday, Oct 12",
    active: true,
    items: [
      {
        icon: "flight_land",
        title: "Land at CDG Airport",
        time: "11:05 AM",
        note:
          'Terminal 2E. Driver will wait at Exit 4 holding a sign "Smith Family".',
      },
      {
        icon: "hotel",
        title: "Check-in: The Luminary Hotel",
        time: "01:00 PM",
        note: "Early check-in requested. Confirmation #FR-88219-X.",
      },
      {
        icon: "restaurant",
        title: "Lunch at The Green Kitchen",
        time: "01:30 PM",
        note: "Table for 2. Vegetarian menu available.",
      },
    ],
  },
  {
    label: "Day 2: Art & Culture",
    date: "Sunday, Oct 13",
    items: [
      {
        icon: "museum",
        title: "Louvre Museum Masterpieces Tour",
        time: "09:30 AM",
        note: "Meet guide at the Pyramid entrance. Skip-the-line tickets included.",
        image:
          "https://images.unsplash.com/photo-1543349689-9a4d426bee8d?auto=format&fit=crop&w=300&q=80",
      },
      {
        icon: "directions_walk",
        title: "Free Time: Tuileries Garden",
        time: "01:00 PM",
        note: "Grab a sandwich from Paul's and sit by the fountain.",
        muted: true,
      },
    ],
  },
];

export default function ItineraryView({ editable = false }: ItineraryViewProps) {
  return (
    <div className="flex flex-col gap-10 xl:flex-row">
      <div className="flex-1">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">
              Your Journey
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              6 Days in Paris, France • Oct 12 - Oct 18
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
            <span className="material-symbols-outlined text-lg">
              edit_calendar
            </span>
            {editable ? "Edit dates" : "View dates"}
          </button>
        </div>

        <div className="relative space-y-12 border-l border-slate-200 pl-6">
          {days.map((day, idx) => (
            <div key={day.label} className="relative">
              <div className="absolute -left-[34px] top-0 flex flex-col items-center">
                <div
                  className={`h-5 w-5 rounded-full border-4 ${
                    day.active
                      ? "bg-slate-900 border-white"
                      : "bg-white border-slate-200"
                  }`}
                />
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-slate-900">
                  {day.label}
                </h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {day.date}
                </p>
              </div>
              <div className="space-y-4">
                {day.items.map((item) => (
                  <div
                    key={item.title}
                    className={`flex gap-4 rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                      item.muted ? "opacity-70" : ""
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <span className="material-symbols-outlined">
                        {item.icon}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-slate-900">
                          {item.title}
                        </h4>
                        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                          {item.time}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{item.note}</p>
                      {item.image ? (
                        <div className="mt-3 h-12 w-16 overflow-hidden rounded-lg">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="relative">
            <div className="absolute -left-[34px] top-0 flex flex-col items-center">
              <div className="h-5 w-5 rounded-full bg-slate-100" />
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 px-4 py-4 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900">
              <span className="material-symbols-outlined">add</span>
              {editable ? "Add to itinerary" : "View upcoming plans"}
            </button>
          </div>
        </div>
      </div>

      <aside className="w-full shrink-0 space-y-6 xl:w-80">
        <div className="sticky top-24 space-y-6">
          <div className="rounded-2xl border border-transparent bg-slate-100 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-lg font-semibold text-slate-900">
                Packing list
              </h4>
              <span className="rounded-lg bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                8/12
              </span>
            </div>
            <div className="space-y-2 text-sm text-slate-700">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-white">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded text-slate-900"
                  defaultChecked
                />
                <span className="line-through text-slate-500">
                  Travel adapters
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-white">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded text-slate-900"
                  defaultChecked
                />
                <span className="line-through text-slate-500">
                  Passport & copies
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-white">
                <input type="checkbox" className="h-4 w-4 rounded text-slate-900" />
                <span>Formal dinner attire</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-white">
                <input type="checkbox" className="h-4 w-4 rounded text-slate-900" />
                <span>Walking shoes</span>
              </label>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
