"use client";
import { useEffect, useMemo, useState } from "react";
import { getItinerary } from "@/features/trips/api";
import type { ItineraryDay } from "@/features/trips/itineraryTypes";

type ItineraryViewProps = {
  editable?: boolean;
  tripId?: string;
  trip?: {
    id?: string;
    titleOrDestination?: string;
    startDate?: string | null;
    endDate?: string | null;
  };
};
export default function ItineraryView({ editable = false, trip, tripId }: ItineraryViewProps) {
  const [packingItems, setPackingItems] = useState([
    { text: "Travel adapters", checked: true },
    { text: "Passport & copies", checked: true },
    { text: "Formal dinner attire", checked: false },
    { text: "Walking shoes", checked: false },
  ]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [menuOpenIndex, setMenuOpenIndex] = useState<number | null>(null);
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  const resolvedTripId = useMemo(() => tripId ?? trip?.id ?? "", [tripId, trip?.id]);

  useEffect(() => {
    let isActive = true;

    const loadItinerary = async () => {
      if (!resolvedTripId) {
        if (isActive) {
          setDays([]);
        }
        return;
      }

      if (isActive) {
        setError(null);
        setLoading(true);
      }

      try {
        const data = await getItinerary(resolvedTripId);
        if (!isActive) return;
        setDays(Array.isArray(data) ? data : []);
      } catch {
        if (!isActive) return;
        setError("Unable to load itinerary. Please try again.");
        setDays([]);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadItinerary();

    return () => {
      isActive = false;
    };
  }, [resolvedTripId, reloadTick]);

  const addPackingItem = () => {
    if (newItemText.trim()) {
      setPackingItems([...packingItems, { text: newItemText.trim(), checked: false }]);
      setNewItemText("");
      setIsExpanded(false);
    }
  };

  const deletePackingItem = (index: number) => {
    const newItems = [...packingItems];
    newItems.splice(index, 1);
    setPackingItems(newItems);
    setEditingIndex(null);
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setNewItemText(packingItems[index].text);
  };

  const saveEdit = () => {
    if (editingIndex !== null && newItemText.trim()) {
      const newItems = [...packingItems];
      newItems[editingIndex].text = newItemText.trim();
      setPackingItems(newItems);
      setEditingIndex(null);
      setNewItemText("");
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setNewItemText("");
  };

  const header = "Your Journey";
  const dates =
    trip?.startDate && trip?.endDate
      ? `${new Date(trip.startDate).toLocaleDateString()} - ${new Date(
            trip.endDate,
          ).toLocaleDateString()}`
      : "Dates TBD";

  return (
    <div className="flex flex-col gap-10 xl:flex-row">
      <div className="flex-1">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">
              {header}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{dates}</p>
          </div>
          <button className="flex items-center gap-2 rounded-xl px-4 py-2.5 shadow-sm btn-primary">
  <span className="material-symbols-outlined text-lg">
    edit_calendar
  </span>
  {editable ? "Edit dates" : "View dates"}
</button>

        </div>
           

        <div className="relative space-y-12 border-l border-slate-200 pl-6">
          {loading ? (
            <div className="space-y-6">
              {[0, 1, 2].map((index) => (
                <div key={index} className="animate-pulse space-y-4">
                  <div className="h-5 w-40 rounded bg-slate-200" />
                  <div className="h-3 w-24 rounded bg-slate-100" />
                  <div className="h-20 rounded-2xl bg-slate-100" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p>{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setReloadTick((t) => t + 1);
                }}
                className="mt-3 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          ) : days.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
              No itinerary yet.
            </div>
          ) : (
            days.map((day) => (
              <div key={day.label} className="relative">
                <div className="absolute -left-[34px] top-0 flex flex-col items-center">
                  <div
                    className={`h-5 w-5 rounded-full border-4 ${
                      day.active
                        ? "bg-slate-900 border-white"
                        : "bg-white border-white"
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
                  {day.items.map((item,index) => (
                    <div
                      key={`${day.label}-${index}`}
                      className={`flex gap-4 rounded-2xl border-white bg-white p-5 shadow-sm transition hover:shadow-md ${
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
            ))
          )}

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
                {packingItems.filter(item => item.checked).length}/{packingItems.length}
              </span>
            </div>
            <div className="space-y-2 text-sm text-slate-700">
              {packingItems.map((item, index) => (
                <div key={index} className="relative">
                  {editingIndex === index ? (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center rounded-lg p-2 bg-white border">
                      <input
                        type="text"
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            saveEdit();
                          } else if (e.key === 'Escape') {
                            cancelEdit();
                          }
                        }}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-slate-900"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 sm:justify-start">
                        <button
                          onClick={saveEdit}
                          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-white">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded text-slate-900"
                        checked={item.checked}
                        onChange={(e) => {
                          const newItems = [...packingItems];
                          newItems[index].checked = e.target.checked;
                          setPackingItems(newItems);
                        }}
                      />
                      <span 
                        className={`flex-1 cursor-pointer ${item.checked ? "line-through text-slate-500" : ""}`}
                        onClick={() => {
                          const newItems = [...packingItems];
                          newItems[index].checked = !newItems[index].checked;
                          setPackingItems(newItems);
                        }}
                      >
                        {item.text}
                      </span>
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpenIndex(menuOpenIndex === index ? null : index)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">more_horiz</span>
                        </button>

                        {menuOpenIndex === index && (
                          <div className="absolute right-0 top-8 z-10 flex gap-1 bg-white rounded-lg border shadow-sm p-1">
                            <button
                              onClick={() => {
                                startEditing(index);
                                setMenuOpenIndex(null);
                              }}
                              className="p-2 rounded text-slate-600 hover:bg-slate-100 transition-colors"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                            <button
                              onClick={() => {
                                deletePackingItem(index);
                                setMenuOpenIndex(null);
                              }}
                              className="p-2 rounded text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="relative mt-4">
              <div
                className={`flex items-center transition-all duration-300 ease-in-out ${
                  isExpanded ? "w-full" : "w-8"
                }`}
              >
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`flex h-8 items-center justify-center rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-all duration-300 ${
                    isExpanded ? "w-8 rounded-r-none" : "w-8"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg leading-none">
                    {isExpanded ? "close" : "lightbulb"}
                  </span>
                </button>

                {isExpanded && (
                  <div className="flex flex-1 items-center gap-2 ml-2">
                    <input
                      type="text"
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addPackingItem();
                        }
                      }}
                      placeholder="Enter item name"
                      className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm text-black focus:border-slate-500 focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={addPackingItem}
                      className="rounded bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            </div>
        </div>
        </div>
      </aside>
    </div>
  );
}
