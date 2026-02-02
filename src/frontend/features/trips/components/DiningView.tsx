"use client";
import { useEffect, useMemo, useState } from "react";
import { DiningReservation } from "./TripWorkspace";
import { getDiningReservations } from "@/features/trips/api";

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

export default function DiningView({ trip, tripId, reservations }: Props) {
  const initial = useMemo(
    () =>
      reservations && reservations.length > 0 ? reservations : fallbackReservations,
    [reservations],
  );
  const [reservationState, setReservationState] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Map API DTO to internal DiningReservation type (ensure required fields)
  function mapDiningReservationDto(apiRes: any): DiningReservation {
    return {
      id: apiRes.id || "",
      name: apiRes.name || "",
      time: apiRes.time || null,
      cuisine: apiRes.cuisine || null,
      priceTier: apiRes.priceTier || null,
      status: apiRes.status || "",
      address: apiRes.address || null,
      notes: apiRes.notes || null,
      confirmationCode: apiRes.confirmationCode || null,
      partySize: apiRes.partySize ?? null,
      imageUrl: apiRes.imageUrl || null,
    };
  }

  useEffect(() => {
    const load = async () => {
      if (!tripId) return;
      try {
        setLoading(true);
        const data = await getDiningReservations(tripId);
        // map API DTOs into internal type to satisfy required fields
        setReservationState(data.map(mapDiningReservationDto));
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
              <button
                onClick={() => setViewMode('grid')}
                aria-pressed={viewMode === 'grid'}
                className={`flex items-center justify-center rounded-lg p-2 shadow-sm transition ${viewMode === 'grid' ? 'bg-white text-slate-900' : 'text-slate-500 hover:bg-white/70'}`}>
                <span className="material-symbols-outlined text-lg">grid_view</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                aria-pressed={viewMode === 'list'}
                className={`ml-1 flex items-center justify-center rounded-lg p-2 shadow-sm transition ${viewMode === 'list' ? 'bg-white text-slate-900' : 'text-slate-500 hover:bg-white/70'}`}>
                <span className="material-symbols-outlined text-lg">format_list_bulleted</span>
              </button>
            </div>
            <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
              <span className="material-symbols-outlined text-lg">add</span>
              Add reservation
            </button>
          </div>
        </div>

        {loading && (
          <p className="text-sm text-slate-600">Loading reservations...</p>
        )}

        {noData && !loading ? (
          <p className="text-sm text-slate-600">
            No dining reservations found for this trip.
          </p>
        ) : (
          viewMode === 'grid' ? (
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
                    <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-900 backdrop-blur-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
                      {reservation.status}
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
          ) : (
            <div className="flex flex-col gap-4">
              {reservationState.map((reservation) => (
                <div key={reservation.id} className="flex items-start gap-4 rounded-lg border bg-white p-4">
                  <div className="h-24 w-24 flex-shrink-0 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url('${reservation.imageUrl ?? ""}')` }} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">{reservation.name}</h3>
                      <span className="text-sm font-medium text-slate-600">{reservation.priceTier ?? ""}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{formatTime(reservation.time)}{reservation.cuisine ? ` • ${reservation.cuisine}` : ''}</p>
                    <p className="mt-2 text-sm text-slate-700">{reservation.notes || "No notes"}</p>
                    <div className="mt-2 text-xs text-slate-600">Confirmation: {reservation.confirmationCode ?? "—"}</div>
                  </div>
                </div>
              ))}
            </div>
          )
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
    </div>
  );
}
function formatTime(iso: string | null) {
  if (!iso) return "TBD";
  const dt = new Date(iso);
  return dt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
