"use client";

import { useState } from "react";

export default function TransportationView() {
  const [segmentState, setSegmentState] = useState(segments);

  const toggleComplete = (title: string) => {
    setSegmentState((prev) =>
      prev.map((seg) =>
        seg.title === title ? { ...seg, completed: !seg.completed } : seg
      )
    );
  };

  return (
    <div className="flex flex-col gap-10 lg:flex-row">
      <div className="flex-1 min-w-0">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">Logistics</h2>
            <p className="mt-1 text-sm text-slate-600">
              Managed travel segments for your upcoming journey
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
              <span className="material-symbols-outlined text-lg">
                add_circle
              </span>
              Add segment
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {segmentState.map((segment) => (
            <div
              key={segment.title}
              className={`group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-lg md:flex-row ${
                segment.completed ? "opacity-70 grayscale" : ""
              }`}
            >
              <div className="h-32 w-full shrink-0 overflow-hidden md:h-auto md:w-48">
                <div
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url('${segment.image}')` }}
                />
              </div>
              <div className="flex flex-1 flex-col items-center gap-6 p-6 md:flex-row">
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl text-slate-900">
                      {segment.icon}
                    </span>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {segment.title}
                    </h3>
                  </div>
                  <div className="mt-4 flex items-center gap-8">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                        {segment.start.label}
                      </p>
                      <p className="text-xl font-bold text-slate-900">
                        {segment.start.time}
                      </p>
                      <p className="text-xs text-slate-600">
                        {segment.start.location}
                      </p>
                    </div>
                    <div className="flex flex-1 flex-col items-center">
                      <div className="relative w-full border-t-2 border-dashed border-slate-200">
                        <span className="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-slate-500">
                          {segment.timelineIcon}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-slate-600">
                        {segment.duration}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                        {segment.end.label}
                      </p>
                      <p className="text-xl font-bold text-slate-900">
                        {segment.end.time}
                      </p>
                      <p className="text-xs text-slate-600">
                        {segment.end.location}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex w-full shrink-0 items-center justify-between gap-4 border-t border-slate-200 pt-4 md:w-auto md:flex-col md:items-start md:justify-between md:border-t-0 md:border-l md:pl-6">
                  <div className="text-right md:text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      {segment.meta.label}
                    </p>
                    <p className="font-mono text-sm font-bold tracking-wider text-slate-900">
                      {segment.meta.value}
                    </p>
                  </div>
                  <button className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold text-slate-900 transition hover:bg-slate-900 hover:text-white">
                    <span className="material-symbols-outlined text-base">
                      {segment.meta.icon}
                    </span>
                    {segment.meta.cta}
                  </button>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={segment.completed}
                      onChange={() => toggleComplete(segment.title)}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    Marked done
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="w-full shrink-0 lg:w-80">
        <div className="sticky top-28 space-y-6">
          <div className="rounded-2xl border border-transparent bg-slate-100 p-6">
            <h4 className="mb-4 text-lg font-semibold text-slate-900">
              Trip summary
            </h4>
            <div className="space-y-4">
              <div className="rounded-xl bg-white/50 p-3">
                <div className="mb-1 flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-900">
                    timelapse
                  </span>
                  <span className="text-sm font-medium text-slate-800">
                    Total travel time
                  </span>
                </div>
                <p className="ml-9 text-xl font-semibold text-slate-900">
                  12h 45m
                </p>
              </div>
              <div className="border-t border-slate-200 pt-2">
                <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                  <span>Segments completed</span>
                  <span>1 / 4</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-[25%] bg-slate-900" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

const segments = [
  {
    title: "Flight AF124",
    icon: "flight_takeoff",
    timelineIcon: "flight",
    image:
      "https://images.unsplash.com/photo-1468141589437-8e32ae39f934?auto=format&fit=crop&w=600&q=80",
    start: { label: "Departure", time: "10:45 AM", location: "JFK, New York" },
    end: { label: "Arrival", time: "11:05 PM", location: "CDG, Paris" },
    duration: "7h 20m",
    completed: true,
    meta: {
      label: "Confirmation",
      value: "QX-7729L",
      cta: "View tickets",
      icon: "confirmation_number",
    },
  },
  {
    title: "Eurostar High-Speed",
    icon: "train",
    timelineIcon: "directions_railway",
    image:
      "https://images.unsplash.com/photo-1456878148510-0ab0d7abb3e0?auto=format&fit=crop&w=600&q=80",
    start: { label: "Departure", time: "08:15 AM", location: "Paris Nord" },
    end: { label: "Arrival", time: "10:30 AM", location: "St Pancras Intl" },
    duration: "2h 15m",
    completed: false,
    meta: {
      label: "Confirmation",
      value: "EUR-90033",
      cta: "View tickets",
      icon: "confirmation_number",
    },
  },
  {
    title: "Premium Car Rental",
    icon: "directions_car",
    timelineIcon: "more_horiz",
    image:
      "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=600&q=80",
    start: { label: "Pick-up", time: "11:00 AM", location: "London Center" },
    end: { label: "Drop-off", time: "06:00 PM", location: "Bristol East" },
    duration: "Flexible",
    completed: false,
    meta: {
      label: "Booking ID",
      value: "HL-CAR-01",
      cta: "Details",
      icon: "receipt_long",
    },
  },
];
