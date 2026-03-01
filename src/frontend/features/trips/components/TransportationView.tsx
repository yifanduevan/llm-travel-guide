"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { TransportSegment } from "./TripWorkspace";
import AddSegmentModal from "./transportation/AddSegmentModal";
import { getTransportIconName, normalizeTransportMode } from "../iconMap";
import { getTransportSegments } from "@/features/trips/api";
import { apiPost } from "@/lib/apiClient";
import type { TransportSegmentDto } from "@/lib/types";
import OverlayModal from "./OverlayModal";
import ConfirmOverlay from "./ConfirmOverlay";

type Props = {
  tripId?: string;
  segments?: TransportSegment[];
};

type CreateTransportSegmentRequest = {
  type: string | null;
  title: string;
  startTime: string | null;
  startLocation: string | null;
  endTime: string | null;
  endLocation: string | null;
  durationText: string | null;
  status: string | null;
  confirmationCode: string | null;
  ticketUrl: string | null;
  completed: boolean;
};

const fallbackSegments: TransportSegment[] = [];

const defaultForm: CreateTransportSegmentRequest = {
  type: "FLIGHT",
  title: "",
  startTime: "",
  startLocation: "",
  endTime: "",
  endLocation: "",
  durationText: "",
  status: "PLANNED",
  confirmationCode: "",
  ticketUrl: "",
  completed: false,
};

async function createTransportSegment(
  tripId: string,
  payload: CreateTransportSegmentRequest,
): Promise<TransportSegmentDto> {
  return apiPost<TransportSegmentDto>(`/api/trips/${tripId}/transport-segments`, payload);
}

function mapCreatePayloadToLocalSegment(payload: CreateTransportSegmentRequest): TransportSegment {
  const mode = normalizeTransportMode(payload.type);
  return {
    id: crypto.randomUUID(),
    mode,
    type: payload.type ?? mode,
    title: payload.title || "Untitled segment",
    startTime: payload.startTime,
    startTz: null,
    startLocation: payload.startLocation,
    endTime: payload.endTime,
    endTz: null,
    endLocation: payload.endLocation,
    durationText: payload.durationText,
    status: payload.status ?? "PLANNED",
    confirmationCode: payload.confirmationCode,
    ticketsUrl: payload.ticketUrl,
    ticketUrl: payload.ticketUrl,
    completed: payload.completed,
  };
}

function mapTransportSegmentDto(dto: TransportSegmentDto): TransportSegment {
  const mode = normalizeTransportMode(dto.type);
  return {
    id: dto.id ?? crypto.randomUUID(),
    mode,
    type: dto.type ?? mode,
    title: dto.title ?? "Untitled segment",
    startTime: dto.startTime ?? null,
    startTz: dto.startTz ?? null,
    startLocation: dto.startLocation ?? null,
    endTime: dto.endTime ?? null,
    endTz: dto.endTz ?? null,
    endLocation: dto.endLocation ?? null,
    durationText: dto.durationText ?? null,
    status: dto.status ?? "PLANNED",
    confirmationCode: dto.confirmationCode ?? null,
    ticketsUrl: dto.ticketUrl ?? null,
    ticketUrl: dto.ticketUrl ?? null,
    completed: dto.completed ?? false,
  };
}

export default function TransportationView({ tripId, segments }: Props) {
  const initial = useMemo(
    () => (segments && segments.length > 0 ? segments : fallbackSegments),
    [segments],
  );

  const [segmentState, setSegmentState] = useState<TransportSegment[]>(initial);
  const [userAddedSegments, setUserAddedSegments] = useState<TransportSegment[]>([]);
  const [completedById, setCompletedById] = useState<Record<string, boolean>>({});

  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<TransportSegment | null>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formState, setFormState] = useState<CreateTransportSegmentRequest>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSegmentState(initial);
  }, [initial]);

  useEffect(() => {
    const load = async () => {
      if (!tripId || (segments && segments.length > 0)) return;
      try {
        setLoading(true);
        setListError(null);
        const data = await getTransportSegments(tripId);
        setSegmentState(data.map(mapTransportSegmentDto));
      } catch (err) {
        setListError(err instanceof Error ? err.message : "Unable to load segments");
      } finally {
        setLoading(false);
      }
    };

    load().catch(() => setLoading(false));
  }, [tripId, segments]);

  const combinedSegments = useMemo(() => {
    const merged = [...segmentState, ...userAddedSegments];
    return merged.map((segment) => ({
      ...segment,
      completed: completedById[segment.id] ?? segment.completed,
    }));
  }, [segmentState, userAddedSegments, completedById]);

  const segmentsById = useMemo(
    () => new Map(combinedSegments.map((segment) => [segment.id, segment])),
    [combinedSegments],
  );

  const toggleComplete = (id: string) => {
    const current = segmentsById.get(id)?.completed ?? false;
    setCompletedById((prev) => ({ ...prev, [id]: !current }));
  };

  const { totalLabel, completedCount, totalCount, progressPct } = useMemo(() => {
    const totalCount = combinedSegments.length;
    const completedCount = combinedSegments.filter((seg) => seg.completed).length;
    const totalMinutes = combinedSegments.reduce(
      (sum, seg) => sum + computeSegmentMinutes(seg),
      0,
    );
    const totalLabel = formatMinutes(totalMinutes);
    const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    return { totalLabel, completedCount, totalCount, progressPct };
  }, [combinedSegments]);

  const noData = combinedSegments.length === 0;

  const handleDelete = async (segmentId: string) => {
    if (!segmentId) return;

    if (!tripId) {
      setUserAddedSegments((prev) => prev.filter((segment) => segment.id !== segmentId));
      setSegmentState((prev) => prev.filter((segment) => segment.id !== segmentId));
      setConfirmTarget(null);
      return;
    }

    setDeletingId(segmentId);
    setListError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
      const res = await fetch(`${baseUrl}/api/trips/${tripId}/transport-segments/${segmentId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to delete segment");
      }
      setSegmentState((prev) => prev.filter((segment) => segment.id !== segmentId));
      setUserAddedSegments((prev) => prev.filter((segment) => segment.id !== segmentId));
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Unable to delete segment");
    } finally {
      setDeletingId(null);
      setConfirmTarget(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tripId) return;

    setSaving(true);
    setError(null);

    const payload: CreateTransportSegmentRequest = {
      ...formState,
      title: formState.title.trim() || "New segment",
      type: (formState.type ?? "OTHER").toUpperCase(),
      startTime: formState.startTime ? new Date(formState.startTime).toISOString() : null,
      endTime: formState.endTime ? new Date(formState.endTime).toISOString() : null,
      startLocation: formState.startLocation?.trim() || null,
      endLocation: formState.endLocation?.trim() || null,
      durationText: formState.durationText?.trim() || null,
      status: formState.status?.trim().toUpperCase() || null,
      confirmationCode: formState.confirmationCode?.trim() || null,
      ticketUrl: formState.ticketUrl?.trim() || null,
    };

    try {
      const created = await createTransportSegment(tripId, payload);
      setSegmentState((prev) => [mapTransportSegmentDto(created), ...prev]);
      setShowAddModal(false);
      setFormState(defaultForm);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to save segment";
      const isNetworkError =
        message.toLowerCase().includes("failed to fetch") ||
        message.toLowerCase().includes("networkerror");

      if (isNetworkError) {
        setSegmentState((prev) => [mapCreatePayloadToLocalSegment(payload), ...prev]);
        setShowAddModal(false);
        setFormState(defaultForm);
        setError(null);
        setListError("Backend unavailable. Segment has been added locally.");
      } else {
        setError(message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 lg:flex-row">
      <div className="min-w-0 flex-1">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">Logistics</h2>
            <p className="mt-1 text-sm text-slate-600">Manage your travel segments for this trip</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              onClick={() => {
                if (tripId) {
                  setShowAddModal(true);
                } else {
                  setIsAddOpen(true);
                }
              }}
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              Add segment
            </button>
          </div>
        </div>

        {listError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {listError}
          </div>
        )}

        {loading && <p className="text-sm text-slate-600">Loading segments...</p>}

        {noData && !loading ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            No transportation segments found for this trip.
          </div>
        ) : (
          <div className="space-y-4">
            {combinedSegments.map((segment) => {
              const normalizedMode = normalizeTransportMode(segment.mode ?? segment.type);
              const ticketsUrl = segment.ticketsUrl ?? segment.ticketUrl ?? null;
              const showTickets = !!ticketsUrl && normalizedMode !== "WALKING";
              const showConfirmation = normalizedMode !== "WALKING";
              const departureTimeLabel = formatTimeInZone(segment.startTime, segment.startTz);
              const arrivalTimeLabel = formatTimeInZone(segment.endTime, segment.endTz);
              const departureDateLabel = formatDateInZone(segment.startTime, segment.startTz);
              const arrivalDateLabel = formatDateInZone(segment.endTime, segment.endTz);
              const showArrivalDate =
                !!departureDateLabel &&
                !!arrivalDateLabel &&
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
                        <h3 className="text-lg font-semibold text-slate-900">{segment.title}</h3>
                      </div>

                      <div className="mt-4 flex items-center gap-8">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Departure</p>
                          <p className="text-xl font-bold text-slate-900">{departureTimeLabel}</p>
                          {departureDateLabel && (
                            <div className="text-[11px] font-medium text-slate-500">{departureDateLabel}</div>
                          )}
                          <p className="text-xs text-slate-600">{segment.startLocation ?? "TBD"}</p>
                        </div>

                        <div className="mt-6 flex flex-1 flex-col items-center">
                          <div className="relative w-full border-t-2 border-dashed border-slate-200">
                            <span className="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-slate-500">
                              {getTransportIconName(segment.mode ?? segment.type)}
                            </span>
                          </div>
                          <p className="mt-3 text-[10px] text-slate-600">{segment.durationText ?? "—"}</p>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Arrival</p>
                          <p className="text-xl font-bold text-slate-900">{arrivalTimeLabel}</p>
                          {arrivalDateLabel && (
                            <div className="flex items-center justify-end gap-2 text-[11px] font-medium text-slate-500">
                              <span>{arrivalDateLabel}</span>
                              {showArrivalDate && (
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">+1 day</span>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-slate-600">{segment.endLocation ?? "TBD"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex w-full shrink-0 items-center justify-between gap-3 border-t border-slate-200 pt-4 md:w-auto md:flex-col md:items-start md:justify-between md:border-l md:border-t-0 md:pl-4">
                      {showConfirmation && (
                        <div className="text-right md:text-left">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Confirmation</p>
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
                          className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold text-slate-900 transition hover:bg-slate-300 hover:text-white"
                        >
                          <span className="material-symbols-outlined text-base">confirmation_number</span>
                          View tickets
                        </a>
                      )}

                      <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={segment.completed}
                            onChange={() => toggleComplete(segment.id)}
                            className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                          />
                          Marked done
                        </label>

                        <button
                          type="button"
                          onClick={() => setConfirmTarget(segment)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
                          title="Delete segment"
                          disabled={deletingId === segment.id}
                        >
                          {deletingId === segment.id ? (
                            <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                          ) : (
                            <span className="material-symbols-outlined text-sm">delete</span>
                          )}
                        </button>
                      </div>
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
            <h4 className="mb-4 text-lg font-semibold text-slate-900">Trip summary</h4>
            <div className="space-y-4">
              <div className="rounded-xl bg-white/50 p-3">
                <div className="mb-1 flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-900">timelapse</span>
                  <span className="text-sm font-medium text-slate-800">Total travel time</span>
                </div>
                <p className="ml-9 text-xl font-semibold text-slate-900">{totalLabel}</p>
              </div>

              <div className="border-t border-slate-200 pt-2">
                <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                  <span>Segments completed</span>
                  <span>
                    {completedCount} / {totalCount}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full bg-slate-900" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {isAddOpen && (
        <AddSegmentModal
          onSave={(segment) => {
            setUserAddedSegments((prev) => [segment, ...prev]);
            setIsAddOpen(false);
          }}
          onClose={() => setIsAddOpen(false)}
        />
      )}

      <OverlayModal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setError(null);
        }}
        title="Add transport segment"
        description="Capture key details for this leg so everyone stays on track."
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
              onClick={() => {
                setShowAddModal(false);
                setError(null);
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="transport-segment-form"
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={saving}
            >
              {saving && (
                <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
              )}
              Save segment
            </button>
          </div>
        }
      >
        <form id="transport-segment-form" className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Title
                <span className="text-red-500">*</span>
              </span>
              <input
                required
                value={formState.title}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="SFO → JFK"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Type</span>
              <select
                value={formState.type ?? ""}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, type: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              >
                <option value="FLIGHT">Flight</option>
                <option value="TRAIN">Train</option>
                <option value="CAR">Car</option>
                <option value="BUS">Bus</option>
                <option value="OTHER">Other</option>
              </select>
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Departure time</span>
              <input
                type="datetime-local"
                value={formState.startTime ?? ""}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, startTime: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Arrival time</span>
              <input
                type="datetime-local"
                value={formState.endTime ?? ""}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, endTime: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Departure location</span>
              <input
                value={formState.startLocation ?? ""}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, startLocation: e.target.value }))
                }
                placeholder="San Francisco (SFO)"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Arrival location</span>
              <input
                value={formState.endLocation ?? ""}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, endLocation: e.target.value }))
                }
                placeholder="New York (JFK)"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Status</span>
              <select
                value={formState.status ?? ""}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              >
                <option value="PLANNED">Planned</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Duration text</span>
              <input
                value={formState.durationText ?? ""}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, durationText: e.target.value }))
                }
                placeholder="5h 45m"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Confirmation code</span>
              <input
                value={formState.confirmationCode ?? ""}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, confirmationCode: e.target.value }))
                }
                placeholder="ABC123"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Ticket URL</span>
              <input
                value={formState.ticketUrl ?? ""}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, ticketUrl: e.target.value }))
                }
                placeholder="https://tickets..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </label>
          </div>
        </form>
      </OverlayModal>

      <ConfirmOverlay
        open={!!confirmTarget}
        title="Delete segment"
        message={
          confirmTarget
            ? `Delete "${confirmTarget.title}" from this trip? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Keep"
        busy={deletingId !== null}
        onCancel={() => setConfirmTarget(null)}
        onConfirm={() => confirmTarget && handleDelete(confirmTarget.id)}
      />
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
