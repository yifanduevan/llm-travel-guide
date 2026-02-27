"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Accommodation } from "./TripWorkspace";
import { getAccommodations } from "@/features/trips/api";
import type { AccommodationDto } from "@/lib/types";
import OverlayModal from "./OverlayModal";
import ConfirmOverlay from "./ConfirmOverlay";

type TripInfo = {
  titleOrDestination?: string;
  startDate?: string | null;
  endDate?: string | null;
  budget?: string | number | null;
  budgetAmount?: number | null;
  totalBudget?: number | null;
};

type Props = {
  tripId: string;
  trip?: TripInfo;
  accommodations?: Accommodation[];
};

type CreateAccommodationRequest = {
  name: string;
  address: string | null;
  roomType: string | null;
  checkIn: string | null;
  checkOut: string | null;
  rate: string | null;
  currency: string | null;
  status: string | null;
  confirmationCode: string | null;
  tags: string[] | null;
  imageUrl: string | null;
  notes: string | null;
};

const defaultForm: CreateAccommodationRequest = {
  name: "",
  address: "",
  roomType: "",
  checkIn: "",
  checkOut: "",
  rate: "",
  currency: "USD",
  status: "PENDING",
  confirmationCode: "",
  tags: [],
  imageUrl: "",
  notes: "",
};

async function createAccommodation(
  tripId: string,
  payload: CreateAccommodationRequest,
): Promise<Accommodation> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  const res = await fetch(
    `${baseUrl}/api/trips/${tripId}/accommodations`,
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
    throw new Error(message || "Failed to create accommodation");
  }
  return (await res.json()) as Accommodation;
}

export default function AccommodationsView({ trip, tripId, accommodations }: Props) {
  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;
  const initial = useMemo(
    () =>
      accommodations && accommodations.length > 0 ? accommodations : [],
    [accommodations],
  );
  const [stays, setStays] = useState<Accommodation[]>(initial);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const {
    totalNights,
    totalHotels,
    totalCost,
    currency,
    hasMixedCurrencies,
    progressPct,
    hasBudget,
  } = useMemo(() => {
    const msPerDay = 24 * 60 * 60 * 1000;
    let nights = 0;
    let hotels = 0;
    const costByCurrency = new Map<string, { total: number; count: number }>();

    stays.forEach((stay) => {
      if (stay.checkIn && stay.checkOut) {
        const checkInDate = parseTripDate(stay.checkIn);
        const checkOutDate = parseTripDate(stay.checkOut);
        if (checkInDate && checkOutDate) {
          const diff = Math.round(
            (checkOutDate.getTime() - checkInDate.getTime()) / msPerDay,
          );
          nights += Math.max(0, diff);
        }
      }

      hotels += 1;

      const rateValue = parseRateValue(stay.rate);
      if (rateValue !== null) {
        const currencyKey = normalizeCurrency(stay.currency);
        const current = costByCurrency.get(currencyKey) ?? {
          total: 0,
          count: 0,
        };
        current.total += rateValue;
        current.count += 1;
        costByCurrency.set(currencyKey, current);
      }
    });

    let totalCostValue: number | null = 0;
    let currencyValue: string | null = null;
    let mixedCurrencies = false;

    if (costByCurrency.size === 1) {
      const [onlyCurrency, payload] = Array.from(costByCurrency.entries())[0];
      totalCostValue = payload.total;
      currencyValue = onlyCurrency;
    } else if (costByCurrency.size > 1) {
      totalCostValue = null;
      mixedCurrencies = true;
    }

    const budgetValue = getBudgetValue(trip);
    const hasBudgetValue = typeof budgetValue === "number" && budgetValue > 0;
    const pct =
      hasBudgetValue && totalCostValue !== null
        ? Math.min(100, Math.round((totalCostValue / budgetValue) * 100))
        : 0;

    return {
      totalNights: nights,
      totalHotels: hotels,
      totalCost: totalCostValue,
      currency: currencyValue,
      hasMixedCurrencies: mixedCurrencies,
      progressPct: pct,
      hasBudget: hasBudgetValue,
    };
  }, [stays, trip]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formState, setFormState] = useState<CreateAccommodationRequest>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Accommodation | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!tripId) return;
      try {
        setLoading(true);
        const data = await getAccommodations(tripId);
        setStays(data.map(mapAccommodationDto));
      } finally {
        setLoading(false);
      }
    };
    if (!accommodations || accommodations.length === 0) {
      load().catch(() => setLoading(false));
    }
  }, [tripId, accommodations]);

  function mapAccommodationDto(dto: AccommodationDto): Accommodation {
    return {
      id: dto.id ?? "",
      name: dto.name ?? "",
      address: dto.address ?? null,
      roomType: dto.roomType ?? null,
      checkIn: dto.checkIn ?? null,
      checkOut: dto.checkOut ?? null,
      rate: dto.rate != null ? String(dto.rate) : null,
      currency: dto.currency ?? null,
      status: dto.status ?? "PENDING",
      confirmationCode: dto.confirmationCode ?? null,
      tags: dto.tags ?? null,
      imageUrl: dto.imageUrl ?? null,
      notes: dto.notes ?? null,
    };
  }

  const noData = stays.length === 0;

  const handleDelete = async (stayId: string) => {
    if (!tripId || !stayId) return;
    setDeletingId(stayId);
    setListError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
      const res = await fetch(
        `${baseUrl}/api/trips/${tripId}/accommodations/${stayId}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to delete accommodation");
      }
      setStays((prev) => prev.filter((stay) => stay.id !== stayId));
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Unable to delete accommodation");
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

    const payload: CreateAccommodationRequest = {
      ...formState,
      name: formState.name.trim() || "New stay",
      address: formState.address?.trim() || null,
      roomType: formState.roomType?.trim() || null,
      checkIn: formState.checkIn || null,
      checkOut: formState.checkOut || null,
      rate:
        formState.rate !== null &&
        formState.rate !== undefined &&
        formState.rate.trim() !== ""
          ? formState.rate.trim()
          : null,
      currency: formState.currency?.trim() || null,
      status: formState.status?.trim().toUpperCase() || null,
      confirmationCode: formState.confirmationCode?.trim() || null,
      tags:
        formState.tags && Array.isArray(formState.tags)
          ? formState.tags
          : null,
      imageUrl: formState.imageUrl?.trim() || null,
      notes: formState.notes?.trim() || null,
    };

    try {
      const created = await createAccommodation(tripId, payload);
      setStays((prev) => [created, ...prev]);
      setShowAddModal(false);
      setFormState(defaultForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save accommodation");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 lg:flex-row">
      <div className="flex-1">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">
               Stays & Havens
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Organize and review your stays
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex items-center justify-center rounded-lg p-2 transition ${
                  viewMode === "grid"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:bg-white/70"
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  grid_view
                </span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`ml-1 flex items-center justify-center rounded-lg p-2 transition ${
                  viewMode === "list"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:bg-white/70"
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  format_list_bulleted
                </span>
              </button>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              onClick={() => setShowAddModal(true)}
            >
              <span className="material-symbols-outlined text-lg">
                add_business
              </span>
              Add stay
            </button>
          </div>
        </div>

        {listError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {listError}
          </div>
        )}

        {loading && (
          <p className="text-sm text-slate-600">Loading accommodations...</p>
        )}

        {noData && !loading ? (
          <div className="rounded-xl border-white border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            No accommodations found for this trip.
          </div>
        ) : viewMode === "grid" ? (
          <div className="space-y-6 transition-opacity transition-transform duration-300">
            {stays.map((stay) => (
              <div
                key={stay.id ?? stay.name}
                className={`group flex flex-col overflow-hidden rounded-2xl border-white bg-white shadow-sm transition duration-300 hover:shadow-xl md:flex-row ${
                  stay.status === "PENDING" ? "opacity-80 grayscale-[0.3]" : ""
                }`}
              >
                <div className="relative h-64 w-full shrink-0 overflow-hidden md:h-auto md:w-72">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url('${stay.imageUrl ?? ""}')` }}
                  />
                  <div
                    className={`absolute left-4 top-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm ${
                      stay.status === "PENDING"
                        ? "border border-red-200/50 bg-red-100/40 text-red-500"
                        : "border border-slate-100 bg-white/95 text-slate-900"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        stay.status === "PENDING" ? "bg-red-500" : "bg-slate-900"
                      }`}
                    />
                    {stay.status === "PENDING" ? "Pending" : "Confirmed"}
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-semibold text-slate-900">
                          {stay.name}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                          <span className="material-symbols-outlined text-base">
                            location_on
                          </span>
                          {stay.address ?? "Address TBD"}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-xs font-bold uppercase tracking-tight text-slate-700">
                          {stay.roomType ?? "Room type"}
                        </div>
                        <div className="mt-1 flex items-baseline justify-end gap-2">
                          <span className="text-2xl font-semibold leading-none text-slate-900">
                            {stay.rate ?? "—"}
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                            {stay.currency ?? ""}
                          </span>
                        </div>
                        <div className="mt-0.5 text-[11px] font-medium text-slate-500">
                          per night
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
                          {stay.checkIn ? new Date(stay.checkIn).toDateString() : "TBD"}
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
                          {stay.checkOut ? new Date(stay.checkOut).toDateString() : "TBD"}
                        </p>
                      </div>
                    </div>

                    <div className="mb-6 flex flex-wrap gap-2">
                      {(stay.tags ?? []).map((tag) => (
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
                      {stay.status === "PENDING" ? (
                        <span className="font-semibold text-red-500">
                          Awaiting final confirmation
                        </span>
                      ) : (
                        <>
                          <span>Confirmation No:</span>
                          <span className="font-mono font-bold tracking-wider text-slate-900">
                            {stay.confirmationCode ?? "—"}
                          </span>
                        </>
                      )}
                    </div>
                    {stay.status === "PENDING" ? (
                      <button className="rounded-lg bg-slate-900/10 px-4 py-1.5 text-xs font-bold text-slate-900 transition hover:bg-slate-900/15">
                        Send reminder
                      </button>
                    ) : (
                      <button
                        type="button"
                              className="relative inline-flex items-center gap-1 text-sm font-bold text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 
                              focus-visible:ring-offset-2 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-slate-900 after:transition-all after:duration-300 hover:after:w-full"
                        >
                          View booking details
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 transition-opacity transition-transform duration-300">
            {stays.map((stay) => {
              const stayNights = getStayNights(stay);
              const stayRange = formatStayRange(stay);

              return (
                <div
                  key={stay.id ?? stay.name}
                  className={`flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 md:flex-row md:items-center md:justify-between ${
                    stay.status === "PENDING" ? "opacity-80" : ""
                  }`}
                >
                  <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
                    <div className="h-20 w-20 overflow-hidden rounded-xl bg-slate-100 md:h-24 md:w-24">
                      <div
                        className="h-full w-full bg-cover bg-center"
                        style={{ backgroundImage: `url('${stay.imageUrl ?? ""}')` }}
                      />
                    </div>
                    <div className="space-y-2">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {stay.name}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {stay.address ?? "Address TBD"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(stay.tags ?? []).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-2 text-sm text-slate-600 md:items-center md:text-center">
                    <span className="font-medium text-slate-900">
                      {stayRange}
                    </span>
                    <span>
                      {stayNights} {stayNights === 1 ? "night" : "nights"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 text-right md:items-end">
                    <div className="text-lg font-semibold text-slate-900">
                      {formatRate(stay.rate, stay.currency)}
                      <span className="ml-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                        {stay.currency ?? ""}
                      </span>
                    </div>
                    <span className="text-xs text-slate-600">
                      Confirmation {stay.confirmationCode ?? "—"}
                    </span>
                    <button
                      type="button"
                      className="relative inline-flex items-center gap-1 text-sm font-bold text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-slate-900 after:transition-all after:duration-300 hover:after:w-full"
                    >
                      View details
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                  )}
                  <button
                    onClick={() => setConfirmTarget(stay)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
                    title="Delete accommodation"
                    disabled={deletingId === stay.id}
                  >
                    {deletingId === stay.id ? (
                      <span className="material-symbols-outlined animate-spin text-sm">
                        progress_activity
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-sm">delete</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <aside className="w-full shrink-0 lg:w-80">
        <div className="sticky top-28 space-y-6">
          <div className="overflow-hidden rounded-2xl border-white bg-white shadow-sm">
            <div className="flex items-center justify-between border-white px-4 py-3">
              <h4 className="text-sm font-semibold text-slate-900">Stay map view</h4>
              <span className="material-symbols-outlined text-lg text-slate-900">
                map
              </span>
            </div>

            <div className="space-y-3 px-4 pb-4">
              {(() => {
                const first = stays.find(
                  (s) => (s.address ?? "").trim().length > 0,
                ) ?? stays[0];
                const query = first
                  ? [first.name, first.address, trip?.titleOrDestination]
                      .filter(Boolean)
                      .join(" ")
                      .trim()
                  : "";

                if (!query) {
                  return (
                    <div className="flex h-48 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-600">
                      No stay address available.
                    </div>
                  );
                }

                return (
                  <>
                    {googleMapsKey ? (
                      <div
                        className="relative w-full min-h-[300px] overflow-hidden rounded-2xl bg-slate-100 pointer-events-auto"
                        style={{ touchAction: "pan-x pan-y" }}
                      >
                        <iframe
                          title="Stay map"
                          src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsKey}&q=${encodeURIComponent(query)}`}
                          className="absolute inset-0 h-full w-full border border-slate-200"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="flex min-h-[300px] items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-600">
                        Map unavailable
                      </div>
                    )}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Open in Google Maps
                    </a>
                  </>
                );
              })()}
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
                <span className="font-bold text-slate-900">
                  {totalNights} {totalNights === 1 ? "Night" : "Nights"}
                </span>
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
                <span className="font-bold text-slate-900">
                  {totalHotels} {totalHotels === 1 ? "Hotel" : "Hotels"}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-4">
                <div className="mb-2 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Est. accommodation cost
                    </p>
                    <p className="text-2xl font-semibold text-slate-900">
                      {totalCost === null
                        ? "—"
                        : formatTotalCost(totalCost, currency)}
                    </p>
                    {hasMixedCurrencies && (
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-amber-600">
                        Mixed currencies
                      </p>
                    )}
                  </div>
                  <span className="mb-1 rounded-md bg-slate-900/10 px-2 py-1 text-[10px] font-bold uppercase text-slate-900">
                    Tax included
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-slate-900"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                {hasBudget && (
                  <p className="mt-2 text-right text-[10px] font-medium text-slate-600">
                    {progressPct}% of total trip budget
                  </p>
                )}
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
        title="Add accommodation"
        description="Capture where you're staying so everyone stays in sync."
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
              form="accommodation-form"
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={saving}
            >
              {saving && (
                <span className="material-symbols-outlined animate-spin text-base">
                  progress_activity
                </span>
              )}
              Save stay
            </button>
          </div>
        }
      >
        <form
          id="accommodation-form"
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
                value={formState.name}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Hotel name"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Room type
              </span>
              <input
                value={formState.roomType ?? ""}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, roomType: e.target.value }))
                }
                placeholder="Queen suite"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Check-in date
              </span>
              <input
                type="date"
                value={formState.checkIn ?? ""}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, checkIn: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Check-out date
              </span>
              <input
                type="date"
                value={formState.checkOut ?? ""}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, checkOut: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Rate per night
              </span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={formState.rate ?? ""}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    rate: e.target.value,
                  }))
                }
                placeholder="250"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Currency
              </span>
              <input
                value={formState.currency ?? ""}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, currency: e.target.value }))
                }
                placeholder="USD"
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
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
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
                placeholder="123 Main St, City"
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

            <label className="space-y-2 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Tags (comma separated)
              </span>
              <input
                value={(formState.tags ?? []).join(", ")}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    tags: e.target.value
                      ? e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
                      : [],
                  }))
                }
                placeholder="wifi, parking"
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
              placeholder="Check-in instructions, parking, etc."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
            />
          </label>
        </form>
      </OverlayModal>

      <ConfirmOverlay
        open={!!confirmTarget}
        title="Delete accommodation"
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

const tagIcons: Record<string, string> = {
  "Wi-Fi": "wifi",
  "Infinity Pool": "pool",
  "Spa": "spa",
  "Valet": "parking_valet",
  "Breakfast": "breakfast_dining",
  "Gym": "fitness_center",
};

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

function parseTripDate(dateStr: string) {
  if (dateOnlyPattern.test(dateStr)) {
    return new Date(`${dateStr}T00:00:00Z`);
  }

  const parsed = new Date(dateStr);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseRateValue(rate: string | number | null) {
  if (rate === null || rate === undefined) return null;
  const value = typeof rate === "number" ? rate : Number(rate);
  return Number.isFinite(value) ? value : null;
}

function normalizeCurrency(currency: string | null) {
  const trimmed = currency?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "UNKNOWN";
}

function formatTotalCost(total: number, currency: string | null) {
  const formatted = new Intl.NumberFormat("en-US").format(total);
  if (!currency || currency === "UNKNOWN") return formatted;
  const symbolCurrencies = new Set(["$", "€", "£", "¥"]);
  if (symbolCurrencies.has(currency)) return `${currency}${formatted}`;
  return `${formatted} ${currency}`;
}

function getBudgetValue(trip?: TripInfo) {
  if (!trip) return null;
  const candidates: Array<string | number | null | undefined> = [
    trip.budgetAmount,
    trip.totalBudget,
    trip.budget,
  ];
  for (const candidate of candidates) {
    const value = typeof candidate === "string" ? Number(candidate) : candidate;
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }
  return null;
}

function formatRate(rate: string | null, currency: string | null) {
  if (!rate) return "—";
  return `${rate}${currency ? ` ${currency}` : ""}`;
}

function getStayNights(stay: Accommodation) {
  if (!stay.checkIn || !stay.checkOut) return 0;
  const checkInDate = parseTripDate(stay.checkIn);
  const checkOutDate = parseTripDate(stay.checkOut);
  if (!checkInDate || !checkOutDate) return 0;
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = Math.round(
    (checkOutDate.getTime() - checkInDate.getTime()) / msPerDay,
  );
  return Math.max(0, diff);
}

function formatStayRange(stay: Accommodation) {
  if (!stay.checkIn || !stay.checkOut) return "Dates TBD";
  const checkInDate = parseTripDate(stay.checkIn);
  const checkOutDate = parseTripDate(stay.checkOut);
  if (!checkInDate || !checkOutDate) return "Dates TBD";
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });
  return `${formatter.format(checkInDate)} – ${formatter.format(checkOutDate)}`;
}
