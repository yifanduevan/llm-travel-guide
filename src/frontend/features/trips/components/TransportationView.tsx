"use client";

import { useMemo, useState } from "react";
import { TransportSegment } from "./TripWorkspace";
import AddSegmentModal from "./transportation/AddSegmentModal";
import { getTransportIconName, normalizeTransportMode } from "../iconMap";

type TripInfo = {
  titleOrDestination?: string;
  startDate?: string | null;
  endDate?: string | null;
};

type Props = { trip?: TripInfo; segments?: TransportSegment[] };


const fallbackSegments: TransportSegment[] = [];

export default function TransportationView({ segments }: Props) {
  const initial = useMemo(
    () => (segments && segments.length > 0 ? segments : fallbackSegments),
    [segments],
  );
  const [userAddedSegments, setUserAddedSegments] = useState<TransportSegment[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [completedById, setCompletedById] = useState<Record<string, boolean>>({});
  const combinedSegments = useMemo(() => {
    const combined = [...initial, ...userAddedSegments];
    return combined.map((segment) => ({
      ...segment,
      completed: completedById[segment.id] ?? segment.completed,
    }));
  }, [initial, userAddedSegments, completedById]);
  const segmentsById = useMemo(
    () => new Map(combinedSegments.map((segment) => [segment.id, segment])),
    [combinedSegments],
  );

  const toggleComplete = (id: string) => {
    const current = segmentsById.get(id)?.completed ?? false;
    setCompletedById((prev) => ({ ...prev, [id]: !current }));
  };

  const noData = !combinedSegments || combinedSegments.length === 0;
  const { totalLabel, completedCount, totalCount, progressPct } = useMemo(() => {
    const totalCount = combinedSegments.length;
    const completedCount = combinedSegments.filter((seg) => seg.completed).length;
    const totalMinutes = combinedSegments.reduce(
      (sum, seg) => sum + computeSegmentMinutes(seg),
      0
    );
    const totalLabel = formatMinutes(totalMinutes);
    const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    return { totalLabel, completedCount, totalCount, progressPct };
  }, [combinedSegments]);

  return (
    <div className="flex flex-col gap-10 lg:flex-row">
      <div className="flex-1 min-w-0">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">
              Logistics
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Manage your travel segments for this trip
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 shadow-sm btn-primary"
            >
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
            {combinedSegments.map((segment) => {
              const normalizedMode = normalizeTransportMode(
                segment.mode ?? segment.type
              );
              const ticketsUrl = segment.ticketsUrl ?? segment.ticketUrl ?? null;
              const showTickets = !!ticketsUrl && normalizedMode !== "WALKING";
              const showConfirmation = normalizedMode !== "WALKING";
              const departureTimeLabel = formatTimeInZone(
                segment.startTime,
                segment.startTz
              );
              const arrivalTimeLabel = formatTimeInZone(
                segment.endTime,
                segment.endTz
              );
              const departureDateLabel = formatDateInZone(
                segment.startTime,
                segment.startTz
              );
              const arrivalDateLabel = formatDateInZone(
                segment.endTime,
                segment.endTz
              );
              const showArrivalDate =
                departureDateLabel &&
                arrivalDateLabel &&
                departureDateLabel !== arrivalDateLabel;

              return (
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
                          {getTransportIconName(segment.mode ?? segment.type)}
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
                            {departureTimeLabel}
                          </p>
                          {departureDateLabel && (
                            <div className="text-[11px] font-medium text-slate-500">
                              {departureDateLabel}
                            </div>
                          )}
                          <p className="text-xs text-slate-600">
                            {segment.startLocation ?? "TBD"}
                          </p>
                        </div>
                        <div className="flex mt-6 flex-1 flex-col items-center">
                          <div className="relative w-full border-t-2 border-dashed border-slate-200">
                            <span className="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-slate-500">
                              {getTransportIconName(segment.mode ?? segment.type)}
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
                            {arrivalTimeLabel}
                          </p>
                          {arrivalDateLabel && (
                            <div className="flex items-center justify-end gap-2 text-[11px] font-medium text-slate-500">
                              <span>{arrivalDateLabel}</span>
                              {showArrivalDate && (
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                                  +1 day
                                </span>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-slate-600">
                            {segment.endLocation ?? "TBD"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full shrink-0 items-center justify-between gap-3 border-t border-slate-200 pt-4 md:w-auto md:flex-col md:items-start md:justify-between md:border-t-0 md:border-l md:pl-4">
                      {showConfirmation && (
                        <div className="text-right md:text-left">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                            Confirmation
                          </p>
                          <p className="font-mono text-sm font-bold tracking-wider text-slate-900">
                            {segment.confirmationCode ?? "—"}
                          </p>
                        </div>
                      )}
                      {showTickets && (
                        <a
                          href={ticketsUrl ?? undefined}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold text-slate-900 transition hover:bg-slate-900 hover:text-white"
                        >
                          <span className="material-symbols-outlined text-base">
                            confirmation_number
                          </span>
                          View tickets
                        </a>
                      )}
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <input
                          type="checkbox"
                          checked={segment.completed}
                          onChange={() => toggleComplete(segment.id)}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                        />
                        Marked done
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
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
                  {totalLabel}
                </p>
              </div>
              <div className="border-t border-slate-200 pt-2">
                <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                  <span>Segments completed</span>
                  <span>
                    {completedCount} / {totalCount}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-slate-900"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {isAddOpen && (
        <AddSegmentModal
          onSave={(segment) => {
            setUserAddedSegments((prev) => [...prev, segment]);
            setIsAddOpen(false);
          }}
          onClose={() => setIsAddOpen(false)}
        />
      )}
    </div>
  );
}

function formatTimeInZone(iso: string | null | undefined, tz?: string | null) {
  if (!iso) return "—";
  const dt = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz || "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(dt);
}

function formatDateInZone(iso: string | null | undefined, tz?: string | null) {
  if (!iso) return "";
  const dt = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz || "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(dt);
}

function computeSegmentMinutes(segment: TransportSegment) {
  if (segment.startTime && segment.endTime) {
    const start = new Date(segment.startTime).getTime();
    const end = new Date(segment.endTime).getTime();
    if (!Number.isNaN(start) && !Number.isNaN(end) && end >= start) {
      return Math.round((end - start) / 60000);
    }
  }

  const text = segment.durationText?.toLowerCase() ?? "";
  const hmMatch = text.match(/(\d+(?:\.\d+)?)\s*h(?:ours?)?\s*(\d+)?\s*m?/);
  if (hmMatch) {
    const hours = parseFloat(hmMatch[1]);
    const minutes = hmMatch[2] ? parseInt(hmMatch[2], 10) : 0;
    return Math.round(hours * 60) + minutes;
  }

  const hoursMatch = text.match(/(\d+(?:\.\d+)?)\s*hours?/);
  if (hoursMatch) {
    return Math.round(parseFloat(hoursMatch[1]) * 60);
  }

  const minutesMatch = text.match(/(\d+)\s*m(?:in(?:utes?)?)?/);
  if (minutesMatch) {
    return parseInt(minutesMatch[1], 10);
  }

  return 0;
}

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
