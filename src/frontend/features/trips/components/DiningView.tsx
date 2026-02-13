"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { DiningReservation } from "./TripWorkspace";
import OverlayModal from "./OverlayModal";
import ConfirmOverlay from "./ConfirmOverlay";

type TripInfo = {
  titleOrDestination?: string;
  startDate?: string | null;
  endDate?: string | null;
};

type Props = {
  tripId: string;
  trip?: TripInfo;
  reservations?: DiningReservation[];
};

const fallbackReservations: DiningReservation[] = [];

type CreateReservationRequest = {
  name: string;
  time: string | null;
  cuisine: string | null;
  priceTier: "TIER_1" | "TIER_2" | "TIER_3" | null;
  status: "CONFIRMED" | "WAITLISTED" | "PENDING" | "CANCELLED";
  address: string | null;
  notes: string | null;
  confirmationCode: string | null;
  partySize: number | null;
  imageUrl: string | null;
};

const defaultForm: CreateReservationRequest = {
  name: "",
  time: "",
  cuisine: "",
  priceTier: "TIER_2",
  status: "PENDING",
  address: "",
  notes: "",
  confirmationCode: "",
  partySize: null,
  imageUrl: "",
};

async function createReservation(
  tripId: string,
  payload: CreateReservationRequest,
): Promise<DiningReservation> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  const res = await fetch(
    `${baseUrl}/api/trips/${tripId}/dining-reservations`,
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
    throw new Error(message || "Failed to create reservation");
  }
  return (await res.json()) as DiningReservation;
}

export default function DiningView({ trip, tripId, reservations }: Props) {
  const initial = useMemo(
    () =>
      reservations && reservations.length > 0 ? reservations : fallbackReservations,
    [reservations],
  );
  const [reservationState, setReservationState] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formState, setFormState] = useState<CreateReservationRequest>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<DiningReservation | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!tripId) return;
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
        const res = await fetch(
          `${baseUrl}/api/trips/${tripId}/dining-reservations`,
        );
        if (!res.ok) return;
        const data = (await res.json()) as DiningReservation[];
        setReservationState(data);
      } finally {
        setLoading(false);
      }
    };
    // Only fetch if we don't already have reservations passed in
    if (!reservations || reservations.length === 0) {
      load().catch(() => setLoading(false));
    }
  }, [tripId, reservations]);

  const noData = !reservationState || reservationState.length === 0;

  const header = trip?.titleOrDestination ?? "Gastronomy";

  const handleDelete = async (reservationId: string) => {
    if (!tripId || !reservationId) return;
    setDeletingId(reservationId);
    setListError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
      const res = await fetch(
        `${baseUrl}/api/trips/${tripId}/dining-reservations/${reservationId}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to delete reservation");
      }
      setReservationState((prev) =>
        prev.filter((reservation) => reservation.id !== reservationId),
      );
    } catch (err) {
      setListError(
        err instanceof Error ? err.message : "Unable to delete reservation",
      );
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

    const payload: CreateReservationRequest = {
      ...formState,
      name: formState.name.trim() || "New Reservation",
      time: formState.time ? new Date(formState.time).toISOString() : null,
      cuisine: formState.cuisine?.trim() || null,
      address: formState.address?.trim() || null,
      notes: formState.notes?.trim() || null,
      confirmationCode: formState.confirmationCode?.trim() || null,
      imageUrl: formState.imageUrl?.trim() || null,
      partySize:
        formState.partySize && !Number.isNaN(Number(formState.partySize))
          ? Number(formState.partySize)
          : null,
      priceTier: formState.priceTier ?? null,
    };

    try {
      const created = await createReservation(tripId, payload);
      setReservationState((prev) => [created, ...prev]);
      setShowAddModal(false);
      setFormState(defaultForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save reservation");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 lg:flex-row">
      <div className="flex-1">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">{header}</h2>
            <p className="mt-1 text-sm text-slate-600">
              Curated dining reservations for your trip
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
            <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                    onClick={() => setShowAddModal(true)}
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Add reservation
            </button>
          </div>
        </div>

        {listError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {listError}
          </div>
        )}

        {loading && (
          <p className="text-sm text-slate-600">Loading reservations...</p>
        )}

        {noData && !loading ? (
          <p className="text-sm text-slate-600">
            No dining reservations found for this trip.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2">
            {reservationState.map((reservation) => (
              <div
                key={reservation.id}
                className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-300 hover:shadow-xl"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{
                      backgroundImage: `url('${reservation.imageUrl ?? ""}')`,
                    }}
                  />
                  <div className="absolute right-4 top-4 flex items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-900 backdrop-blur-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
                      {reservation.status}
                    </div>
                    <button
                      onClick={() => setConfirmTarget(reservation)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 transition hover:bg-white"
                      title="Delete reservation"
                      disabled={deletingId === reservation.id}
                    >
                      {deletingId === reservation.id ? (
                        <span className="material-symbols-outlined animate-spin text-base">
                          progress_activity
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-base">
                          delete
                        </span>
                      )}
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {reservation.name}
                    </h3>
                    <span className="text-sm font-medium text-slate-600">
                      {reservation.priceTier ?? ""}
                    </span>
                  </div>
                  <div className="mb-4 flex flex-wrap gap-4 text-xs font-medium text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">
                        schedule
                      </span>
                      {formatTime(reservation.time)}
                    </div>
                    {reservation.cuisine && (
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">
                          restaurant_menu
                        </span>
                        {reservation.cuisine}
                      </div>
                    )}
                    {reservation.partySize && (
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">
                          group
                        </span>
                        {reservation.partySize} guests
                      </div>
                    )}
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-tight text-slate-900">
                      Notes
                    </label>
                    <p className="text-sm text-slate-700">
                      {reservation.notes || "No notes"}
                    </p>
                  </div>
                  <div className="mt-3 text-xs text-slate-600">
                    Confirmation: {reservation.confirmationCode ?? "—"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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

      <OverlayModal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setError(null);
        }}
        title="Add dining reservation"
        description="Capture the essentials so your trip stays organized. You can always edit later."
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
              form="dining-reservation-form"
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={saving}
            >
              {saving && (
                <span className="material-symbols-outlined animate-spin text-base">
                  progress_activity
                </span>
              )}
              Save reservation
            </button>
          </div>
        }
      >
        <form
          id="dining-reservation-form"
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
                Name
                <span className="text-red-500">*</span>
              </span>
              <input
                required
                name="name"
                value={formState.name}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. Atelier Crenn"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Date & time
              </span>
              <input
                type="datetime-local"
                value={formState.time ?? ""}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, time: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Cuisine
              </span>
              <input
                value={formState.cuisine ?? ""}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, cuisine: e.target.value }))
                }
                placeholder="French, Sushi, Tapas"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Price tier
              </span>
              <select
                value={formState.priceTier ?? ""}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    priceTier:
                      e.target.value === ""
                        ? null
                        : (e.target.value as CreateReservationRequest["priceTier"]),
                  }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              >
                <option value="">Select</option>
                <option value="TIER_1">$</option>
                <option value="TIER_2">$$</option>
                <option value="TIER_3">$$$</option>
              </select>
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Status
              </span>
              <select
                required
                value={formState.status}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    status: e.target.value as CreateReservationRequest["status"],
                  }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              >
                <option value="CONFIRMED">Confirmed</option>
                <option value="WAITLISTED">Waitlisted</option>
                <option value="PENDING">Pending</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Party size
              </span>
              <input
                type="number"
                min={1}
                value={formState.partySize ?? ""}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    partySize: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                placeholder="2"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Address
              </span>
              <input
                value={formState.address ?? ""}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, address: e.target.value }))
                }
                placeholder="3127 Fillmore St, San Francisco"
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
                  setFormState((prev) => ({
                    ...prev,
                    confirmationCode: e.target.value,
                  }))
                }
                placeholder="ABC123"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Image URL
              </span>
              <input
                value={formState.imageUrl ?? ""}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, imageUrl: e.target.value }))
                }
                placeholder="https://images..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Notes
            </span>
            <textarea
              rows={3}
              value={formState.notes ?? ""}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Add dietary needs, arrival info, or reminders."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
            />
          </label>
        </form>
      </OverlayModal>

      <ConfirmOverlay
        open={!!confirmTarget}
        title="Delete reservation"
        message={
          confirmTarget
            ? `Delete "${confirmTarget.name}" from this trip? This cannot be undone.`
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
