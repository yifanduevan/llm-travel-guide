"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { TransportSegment } from "./TripWorkspace";
import { getTransportSegments } from "@/features/trips/api";
import type { TransportSegmentDto } from "@/lib/types";
import OverlayModal from "./OverlayModal";
import ConfirmOverlay from "./ConfirmOverlay";

type TripInfo = {
  titleOrDestination?: string;
  startDate?: string | null;
  endDate?: string | null;
};

type Props = { tripId: string; trip?: TripInfo; segments?: TransportSegment[] };

const fallbackSegments: TransportSegment[] = [];

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
): Promise<TransportSegment> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  const res = await fetch(
    `${baseUrl}/api/trips/${tripId}/transport-segments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Failed to create transport segment");
  }
  return (await res.json()) as TransportSegment;
}

export default function TransportationView({ trip, segments, tripId }: Props) {
  const initial = useMemo(
    () => (segments && segments.length > 0 ? segments : fallbackSegments),
    [segments],
  );
  const [segmentState, setSegmentState] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formState, setFormState] = useState<CreateTransportSegmentRequest>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<TransportSegment | null>(null);

  useEffect(() => {
    setSegmentState(initial);
  }, [initial]);

  // Map API DTO to internal type (fill required keys)
  function mapTransportSegmentDto(dto: TransportSegmentDto): TransportSegment {
    return {
      id: dto.id ?? "",
      type: dto.type ?? "",
      title: dto.title ?? "",
      startTime: dto.startTime ?? null,
      startLocation: dto.startLocation ?? null,
      endTime: dto.endTime ?? null,
      endLocation: dto.endLocation ?? null,
      durationText: dto.durationText ?? null,
      status: dto.status ?? "",
      confirmationCode: dto.confirmationCode ?? null,
      ticketUrl: dto.ticketUrl ?? null,
      completed: dto.completed ?? false,
    };
  }

  useEffect(() => {
    const load = async () => {
      if (!tripId) return;
      try {
        setLoading(true);
        const data = await getTransportSegments(tripId);
        setSegmentState(data.map(mapTransportSegmentDto));
      } finally {
        setLoading(false);
      }
    };
    if (!segments || segments.length === 0) {
      load().catch(() => setLoading(false));
    }
  }, [tripId, segments]);

  const toggleComplete = (title: string) => {
    setSegmentState((prev) =>
      prev.map((seg) =>
        seg.title === title ? { ...seg, completed: !seg.completed } : seg
      )
    );
  };

  const handleDelete = async (segmentId: string) => {
    if (!tripId || !segmentId) return;
    setDeletingId(segmentId);
    setListError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
      const res = await fetch(
        `${baseUrl}/api/trips/${tripId}/transport-segments/${segmentId}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to delete segment");
      }
      setSegmentState((prev) => prev.filter((segment) => segment.id !== segmentId));
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
      setSegmentState((prev) => [created, ...prev]);
      setShowAddModal(false);
      setFormState(defaultForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save segment");
    } finally {
      setSaving(false);
    }
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
            <button
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              onClick={() => setShowAddModal(true)}
            >
              <span className="material-symbols-outlined text-lg">
                add_circle
              </span>
              Add segment
            </button>
          </div>
        </div>

        {listError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {listError}
          </div>
        )}

        {loading && (
          <p className="text-sm text-slate-600">Loading segments...</p>
        )}

        {noData && !loading ? (
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
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={segment.completed}
                        onChange={() => toggleComplete(segment.title)}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      Marked done
                    </label>
                    <button
                      onClick={() => setConfirmTarget(segment)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
                      title="Delete segment"
                      disabled={deletingId === segment.id}
                    >
                      {deletingId === segment.id ? (
                        <span className="material-symbols-outlined animate-spin text-sm">
                          progress_activity
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-sm">delete</span>
                      )}
                    </button>
                  </div>
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
                <span className="material-symbols-outlined animate-spin text-base">
                  progress_activity
                </span>
              )}
              Save segment
            </button>
          </div>
        }
      >
        <form
          id="transport-segment-form"
          className="space-y-4"
          onSubmit={handleSubmit}
        >
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
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Type
              </span>
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
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Departure time
              </span>
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
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Arrival time
              </span>
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
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Departure location
              </span>
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
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Arrival location
              </span>
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
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Status
              </span>
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
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Duration text
              </span>
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
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Confirmation code
              </span>
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
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Ticket URL
              </span>
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
