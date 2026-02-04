"use client";

import { useEffect, useMemo, useState } from "react";
import { TransportSegment } from "./TripWorkspace";

type TripInfo = {
  titleOrDestination?: string;
  startDate?: string | null;
  endDate?: string | null;
};

type Props = { trip?: TripInfo; segments?: TransportSegment[] };

const fallbackImage =
  "https://images.unsplash.com/photo-1468141589437-8e32ae39f934?auto=format&fit=crop&w=600&q=80";

const fallbackSegments: TransportSegment[] = [];

export default function TransportationView({ trip, segments }: Props) {
  const initial = useMemo(
    () => (segments && segments.length > 0 ? segments : fallbackSegments),
    [segments],
  );
  const [segmentState, setSegmentState] = useState(initial);

  useEffect(() => {
    setSegmentState(initial);
  }, [initial]);

  const toggleComplete = (title: string) => {
    setSegmentState((prev) =>
      prev.map((seg) =>
        seg.title === title ? { ...seg, completed: !seg.completed } : seg
      )
    );
  };

  const noData = !segmentState || segmentState.length === 0;

  return (
    <div className="flex flex-col gap-10 lg:flex-row">
      <div className="flex-1 min-w-0">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">
              {trip?.titleOrDestination ?? "Logistics"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Managed travel segments for your upcoming journey
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-xl px-4 py-2.5 shadow-sm btn-primary">
              <span className="material-symbols-outlined text-lg">
                add_circle
              </span>
              Add segment
            </button>
          </div>
        </div>

        {noData ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            No transportation segments found for this trip.
          </div>
        ) : (
          <div className="space-y-4">
            {segmentState.map((segment) => (
            <div
              key={segment.id}
              className={`group flex flex-col overflow-hidden rounded-2xl border-white bg-white shadow-sm transition hover:shadow-lg md:flex-row ${
                segment.completed ? "opacity-70 grayscale" : ""
              }`}
            >
              <div className="flex flex-1 flex-col items-center gap-6 p-6 md:flex-row">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl text-slate-900">
                      {segmentIcon(segment.type)}
                    </span>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {segment.title}
                    </h3>
                  </div>
                  <div className="mt-4 flex items-center gap-8">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                        Departure
                      </p>
                      <p className="text-xl font-bold text-slate-900">
                        {formatTime(segment.startTime)}
                      </p>
                      <p className="text-xs text-slate-600">
                        {segment.startLocation ?? "TBD"}
                      </p>
                    </div>
                    <div className="flex mt-6 flex-1 flex-col items-center">
                      <div className="relative w-full border-t-2 border-dashed border-slate-200">
                        <span className="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-slate-500">
                          {segmentIcon(segment.type)}
                        </span>
                      </div>
                      <p className="mt-3 text-[10px] text-slate-600">
                        {segment.durationText ?? "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                        Arrival
                      </p>
                      <p className="text-xl font-bold text-slate-900">
                        {formatTime(segment.endTime)}
                      </p>
                      <p className="text-xs text-slate-600">
                        {segment.endLocation ?? "TBD"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex w-full shrink-0 items-center justify-between gap-3 border-t border-slate-200 pt-4 md:w-auto md:flex-col md:items-start md:justify-between md:border-t-0 md:border-l md:pl-4">
                  <div className="text-right md:text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      Confirmation
                    </p>
                    <p className="font-mono text-sm font-bold tracking-wider text-slate-900">
                      {segment.confirmationCode ?? "—"}
                    </p>
                  </div>
                  <button className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold text-slate-900 transition hover:bg-slate-900 hover:text-white">
                    <span className="material-symbols-outlined text-base">
                      confirmation_number
                    </span>
                    View tickets
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
        )}
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

function formatTime(iso: string | null) {
  if (!iso) return "TBD";
  const dt = new Date(iso);
  return dt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function segmentIcon(type: string) {
  switch (type) {
    case "FLIGHT":
      return "flight_takeoff";
    case "TRAIN":
      return "train";
    case "CAR":
      return "directions_car";
    case "BUS":
      return "directions_bus";
    default:
      return "more_horiz";
  }
}
