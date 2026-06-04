"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { generateItinerary, getItinerary } from "@/features/trips/api";
import type { ItineraryItem } from "@/features/trips/itineraryTypes";
import ConfirmOverlay from "./ConfirmOverlay";
import EditItineraryItemModal from "./itinerary/EditItineraryItemModal";
import ItineraryDaySection from "./itinerary/ItineraryDaySection";
import ItineraryEmptyDaySection from "./itinerary/ItineraryEmptyDaySection";
import ItineraryItemCard from "./itinerary/ItineraryItemCard";
import PackingListPanel from "./itinerary/PackingListPanel";
import { buildNextItineraryDay, splitDayLabel } from "./itinerary/dayUtils";
import {
  findItemById,
  getDayDropZoneId,
  hydrateTimelineDays,
  isEmptyDayPlaceholder,
  moveItemForDrag,
  toBuildableDay,
  toClientDay,
  withClientItemId,
} from "./itinerary/dragDropUtils";
import {
  formatPickerTimeToDisplay,
  parseDisplayTimeToPicker,
} from "./itinerary/timeUtils";
import type {
  EditableItineraryItem,
  EditingItemForm,
  EditingItemTarget,
  ItineraryTimelineEntry,
} from "./itinerary/types";

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

function getDayNumberFromLabel(label: string, fallback: number): number {
  const match = label.match(/Day\s+(\d+)/i);
  if (!match) return fallback;

  const numeric = Number(match[1]);
  return Number.isFinite(numeric) ? numeric : fallback;
}

export default function ItineraryView({
  editable = false,
  trip,
  tripId,
}: ItineraryViewProps) {
  const [days, setDays] = useState<ItineraryTimelineEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [confirmItemDeleteTarget, setConfirmItemDeleteTarget] = useState<{
    dayIndex: number;
    itemIndex: number;
    title: string;
  } | null>(null);
  const [confirmDayDeleteTarget, setConfirmDayDeleteTarget] = useState<{
    dayIndex: number;
    dayLabel: string;
  } | null>(null);
  const [editingItemTarget, setEditingItemTarget] =
    useState<EditingItemTarget | null>(null);
  const [editingItemForm, setEditingItemForm] = useState<EditingItemForm>({
    title: "",
    time: "",
    note: "",
  });
  const [addActivityTargetDayIndex, setAddActivityTargetDayIndex] = useState<
    number | null
  >(null);
  const [addActivityForm, setAddActivityForm] = useState<EditingItemForm>({
    title: "",
    time: parseDisplayTimeToPicker("09:00 AM"),
    note: "",
  });
  const [editingDayTitleDayIndex, setEditingDayTitleDayIndex] = useState<
    number | null
  >(null);
  const [editingDayTitleDraft, setEditingDayTitleDraft] = useState("");
  const [activeDragItemId, setActiveDragItemId] = useState<string | null>(null);
  const dragSnapshotRef = useRef<ItineraryTimelineEntry[] | null>(null);
  const daysRef = useRef<ItineraryTimelineEntry[]>([]);
  const activeDragItemIdRef = useRef<string | null>(null);
  const dragOverFrameRef = useRef<number | null>(null);
  const pendingDragOverIdRef = useRef<string | null>(null);
  const lastAppliedOverIdRef = useRef<string | null>(null);

  const pointerSensorOptions = useMemo(
    () => ({
      activationConstraint: {
        distance: 6,
      },
    }),
    [],
  );
  const keyboardSensorOptions = useMemo(
    () => ({
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    [],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, pointerSensorOptions),
    useSensor(KeyboardSensor, keyboardSensorOptions),
  );
  const collisionDetectionStrategy: CollisionDetection = useCallback((args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }

    const intersections = rectIntersection(args);
    if (intersections.length > 0) {
      return intersections;
    }

    return closestCenter(args);
  }, []);

  const resolvedTripId = useMemo(() => tripId ?? trip?.id ?? "", [tripId, trip?.id]);
  const activeDragItem = useMemo(
    () => (activeDragItemId ? findItemById(days, activeDragItemId) : null),
    [activeDragItemId, days],
  );

  useEffect(() => {
    daysRef.current = days;
  }, [days]);

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
        setErrorMessage(null);
        setLoading(true);
      }

      try {
        const data = await getItinerary(resolvedTripId);
        if (!isActive) return;
        setDays(hydrateTimelineDays(Array.isArray(data) ? data : []));
      } catch {
        if (!isActive) return;
        setStatus("error");
        setErrorMessage("Unable to load itinerary. Please try again.");
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

  useEffect(() => {
    setStatus("idle");
    setErrorMessage(null);
  }, [resolvedTripId]);

  const runGenerateItinerary = async () => {
    setStatus("loading");
    setErrorMessage(null);

    try {
      const data = await generateItinerary(resolvedTripId);
      setDays(hydrateTimelineDays(data));
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Generation failed. Please try again.",
      );
    }
  };

  const handleConfirmDeleteItem = () => {
    if (!confirmItemDeleteTarget) return;

    setDays((prev) =>
      prev
        .map((entry, dayIndex) => {
          if (isEmptyDayPlaceholder(entry)) {
            return entry;
          }

          if (dayIndex !== confirmItemDeleteTarget.dayIndex) {
            return entry;
          }

          return {
            ...entry,
            items: entry.items.filter(
              (_, itemIndex) => itemIndex !== confirmItemDeleteTarget.itemIndex,
            ),
          };
        })
        .filter((entry) => isEmptyDayPlaceholder(entry) || entry.items.length > 0),
    );

    setConfirmItemDeleteTarget(null);
  };

  const handleConfirmDeleteDay = () => {
    if (!confirmDayDeleteTarget) return;

    setDays((prev) => {
      const targetEntry = prev[confirmDayDeleteTarget.dayIndex];
      if (!targetEntry || isEmptyDayPlaceholder(targetEntry)) {
        return prev;
      }

      const isLastDayInTimeline = confirmDayDeleteTarget.dayIndex === prev.length - 1;
      if (isLastDayInTimeline) {
        return prev.filter((_, index) => index !== confirmDayDeleteTarget.dayIndex);
      }

      const placeholder = {
        clientDayId: targetEntry.clientDayId,
        type: "emptyDay",
        dayNumber: getDayNumberFromLabel(
          targetEntry.label,
          confirmDayDeleteTarget.dayIndex + 1,
        ),
        date: targetEntry.date,
      } as const;

      return prev.map((entry, index) =>
        index === confirmDayDeleteTarget.dayIndex ? placeholder : entry,
      );
    });

    setConfirmDayDeleteTarget(null);
  };

  const openEditItemModal = (
    dayIndex: number,
    itemIndex: number,
    item: EditableItineraryItem,
  ) => {
    setEditingItemTarget({ dayIndex, itemIndex });
    setEditingItemForm({
      title: item.title,
      time: parseDisplayTimeToPicker(item.time),
      note: item.note,
    });
  };

  const closeEditItemModal = () => {
    setEditingItemTarget(null);
  };

  const openAddActivityModal = (dayIndex: number) => {
    setAddActivityTargetDayIndex(dayIndex);
    setAddActivityForm({
      title: "",
      time: parseDisplayTimeToPicker("09:00 AM"),
      note: "",
    });
  };

  const closeAddActivityModal = () => {
    setAddActivityTargetDayIndex(null);
  };

  const handleSaveEditedItem = () => {
    if (!editingItemTarget) return;

    setDays((prev) =>
      prev.map((entry, dayIndex) => {
        if (isEmptyDayPlaceholder(entry) || dayIndex !== editingItemTarget.dayIndex) {
          return entry;
        }

        return {
          ...entry,
          items: entry.items.map((item, itemIndex) => {
            if (itemIndex !== editingItemTarget.itemIndex) return item;

            return {
              ...item,
              title: editingItemForm.title.trim() || item.title,
              time: formatPickerTimeToDisplay(editingItemForm.time) || item.time,
              note: editingItemForm.note.trim() || item.note,
            };
          }),
        };
      }),
    );

    setEditingItemTarget(null);
  };

  const handleSaveAddedActivity = () => {
    if (addActivityTargetDayIndex === null) return;

    const nextActivity = withClientItemId({
      icon: "local_activity",
      title: addActivityForm.title.trim() || "New activity",
      time: formatPickerTimeToDisplay(addActivityForm.time) || "09:00 AM",
      note: addActivityForm.note.trim() || "Details to be confirmed.",
    } satisfies ItineraryItem);

    setDays((prev) =>
      prev.map((entry, dayIndex) =>
        !isEmptyDayPlaceholder(entry) && dayIndex === addActivityTargetDayIndex
          ? {
              ...entry,
              items: [...entry.items, nextActivity],
            }
          : entry,
      ),
    );

    setAddActivityTargetDayIndex(null);
  };

  const handleAddNewDay = () => {
    setDays((prev) => {
      const buildableDays = prev.map((entry) => toBuildableDay(entry));

      return [...prev, toClientDay(buildNextItineraryDay(buildableDays, trip?.startDate))];
    });
  };

  const handleAddDayFromPlaceholder = (dayIndex: number) => {
    setDays((prev) =>
      prev.map((entry, index) => {
        if (index !== dayIndex || !isEmptyDayPlaceholder(entry)) {
          return entry;
        }

        return {
          clientDayId: entry.clientDayId,
          label: `Day ${entry.dayNumber}: New day`,
          date: entry.date,
          active: false,
          items: [],
        };
      }),
    );
  };

  const startDayTitleInlineEdit = (dayIndex: number) => {
    const day = days[dayIndex];
    if (!day || isEmptyDayPlaceholder(day)) return;

    const { title } = splitDayLabel(day.label, dayIndex + 1);
    setEditingDayTitleDayIndex(dayIndex);
    setEditingDayTitleDraft(title);
  };

  const cancelDayTitleInlineEdit = () => {
    setEditingDayTitleDayIndex(null);
    setEditingDayTitleDraft("");
  };

  const clearScheduledDragOver = useCallback(() => {
    if (dragOverFrameRef.current !== null) {
      cancelAnimationFrame(dragOverFrameRef.current);
      dragOverFrameRef.current = null;
    }

    pendingDragOverIdRef.current = null;
  }, []);

  const applyDragMove = useCallback((overId: string) => {
    const activeId = activeDragItemIdRef.current;
    if (!activeId) {
      return;
    }

    if (lastAppliedOverIdRef.current === overId) {
      return;
    }

    setDays((prev) => moveItemForDrag(prev, activeId, overId));
    lastAppliedOverIdRef.current = overId;
  }, []);

  const resetDragState = useCallback(() => {
    clearScheduledDragOver();
    setActiveDragItemId(null);
    activeDragItemIdRef.current = null;
    dragSnapshotRef.current = null;
    lastAppliedOverIdRef.current = null;
  }, [clearScheduledDragOver]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (!editable) return;

    const activeId = String(event.active.id);
    const currentDays = daysRef.current;
    if (!findItemById(currentDays, activeId)) {
      return;
    }

    dragSnapshotRef.current = currentDays;
    activeDragItemIdRef.current = activeId;
    pendingDragOverIdRef.current = null;
    lastAppliedOverIdRef.current = null;
    setActiveDragItemId(activeId);
  }, [editable]);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      if (!editable || !activeDragItemIdRef.current) return;

      const overId = event.over?.id ? String(event.over.id) : null;
      if (!overId) return;

      if (
        pendingDragOverIdRef.current === overId ||
        lastAppliedOverIdRef.current === overId
      ) {
        return;
      }

      pendingDragOverIdRef.current = overId;
      if (dragOverFrameRef.current !== null) {
        return;
      }

      dragOverFrameRef.current = requestAnimationFrame(() => {
        dragOverFrameRef.current = null;
        const pendingOverId = pendingDragOverIdRef.current;
        pendingDragOverIdRef.current = null;

        if (!pendingOverId) {
          return;
        }

        applyDragMove(pendingOverId);
      });
    },
    [applyDragMove, editable],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (!activeDragItemIdRef.current) return;

      const overId = event.over?.id
        ? String(event.over.id)
        : pendingDragOverIdRef.current;

      clearScheduledDragOver();

      if (!overId) {
        if (dragSnapshotRef.current) {
          setDays(dragSnapshotRef.current);
        }
        resetDragState();
        return;
      }

      applyDragMove(overId);
      resetDragState();
    },
    [applyDragMove, clearScheduledDragOver, resetDragState],
  );

  const handleDragCancel = useCallback(() => {
    if (dragSnapshotRef.current) {
      setDays(dragSnapshotRef.current);
    }

    resetDragState();
  }, [resetDragState]);

  useEffect(() => {
    return () => {
      if (dragOverFrameRef.current !== null) {
        cancelAnimationFrame(dragOverFrameRef.current);
      }
    };
  }, []);

  const handleSaveDayTitle = () => {
    if (editingDayTitleDayIndex === null) return;

    setDays((prev) =>
      prev.map((entry, dayIndex) => {
        if (isEmptyDayPlaceholder(entry) || dayIndex !== editingDayTitleDayIndex) {
          return entry;
        }

        const { prefix, title } = splitDayLabel(entry.label, dayIndex + 1);
        const nextTitle = editingDayTitleDraft.trim() || title || "New day";
        return {
          ...entry,
          label: `${prefix}${nextTitle}`,
        };
      }),
    );

    setEditingDayTitleDayIndex(null);
    setEditingDayTitleDraft("");
  };

  const header = "Your Journey";
  const formatLocalDate = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US");
  };
  const dates =
    trip?.startDate && trip?.endDate
      ? `${formatLocalDate(trip.startDate)} - ${formatLocalDate(trip.endDate)}`
      : "Dates TBD";

  return (
    <div className="flex flex-col gap-10 xl:flex-row">
      <div className="flex-1">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">{header}</h2>
            <p className="mt-1 text-sm text-slate-600">{dates}</p>
          </div>
          {!editable && (
            <button
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 shadow-sm btn-primary disabled:cursor-not-allowed disabled:opacity-70"
              onClick={runGenerateItinerary}
              disabled={status === "loading"}
            >
              <span
                className={`material-symbols-outlined text-lg ${status === "loading" ? "animate-spin" : ""}`}
              >
                {status === "loading" ? "autorenew" : "edit_calendar"}
              </span>
              {status === "loading" ? "Generating..." : "Generate Itinerary"}
            </button>
          )}
        </div>

        {status === "loading" && (
          <p className="mb-4 text-sm text-slate-600">Generating itinerary...</p>
        )}

        {status === "error" && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{errorMessage ?? "Unable to load itinerary. Please try again."}</p>
            <button
              onClick={() => {
                if (days.length === 0) {
                  setReloadTick((t) => t + 1);
                } else {
                  void runGenerateItinerary();
                }
              }}
              className="mt-3 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

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
          ) : days.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
              No itinerary yet.
            </div>
          ) : (
            <>
              {editable ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={collisionDetectionStrategy}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  onDragCancel={handleDragCancel}
                >
                  {days.map((entry, dayIndex) => {
                    if (isEmptyDayPlaceholder(entry)) {
                      return (
                        <ItineraryEmptyDaySection
                          key={entry.clientDayId}
                          entry={entry}
                          dayIndex={dayIndex}
                          editable={editable}
                          dropZoneId={getDayDropZoneId(dayIndex)}
                          onAddDay={handleAddDayFromPlaceholder}
                        />
                      );
                    }

                    const dayLabelParts = splitDayLabel(entry.label, dayIndex + 1);
                    const isEditingDayTitle = editingDayTitleDayIndex === dayIndex;

                    return (
                      <ItineraryDaySection
                        key={entry.clientDayId}
                        day={entry}
                        dayIndex={dayIndex}
                        editable={editable}
                        dragEnabled={editable}
                        dropZoneId={getDayDropZoneId(dayIndex)}
                        onEditItem={openEditItemModal}
                        onDeleteItem={(targetDayIndex, itemIndex, title) =>
                          setConfirmItemDeleteTarget({
                            dayIndex: targetDayIndex,
                            itemIndex,
                            title,
                          })
                        }
                        onAddActivity={openAddActivityModal}
                        onEditDayTitle={startDayTitleInlineEdit}
                        onDeleteDay={(targetDayIndex, dayLabel) =>
                          setConfirmDayDeleteTarget({
                            dayIndex: targetDayIndex,
                            dayLabel,
                          })
                        }
                        dayTitlePrefix={dayLabelParts.prefix}
                        dayTitleDraft={
                          isEditingDayTitle ? editingDayTitleDraft : dayLabelParts.title
                        }
                        isEditingDayTitle={isEditingDayTitle}
                        onDayTitleDraftChange={setEditingDayTitleDraft}
                        onSaveDayTitle={handleSaveDayTitle}
                        onCancelDayTitle={cancelDayTitleInlineEdit}
                      />
                    );
                  })}

                  <DragOverlay>
                    {activeDragItem ? (
                      <div className="w-[min(680px,calc(100vw-4rem))]">
                        <ItineraryItemCard
                          item={activeDragItem}
                          editable={false}
                          onEdit={() => undefined}
                          onDelete={() => undefined}
                          isDragging
                        />
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              ) : (
                days.map((entry, dayIndex) => {
                  if (isEmptyDayPlaceholder(entry)) {
                    return (
                      <ItineraryEmptyDaySection
                        key={entry.clientDayId}
                        entry={entry}
                        dayIndex={dayIndex}
                        editable={false}
                        dropZoneId={getDayDropZoneId(dayIndex)}
                        onAddDay={handleAddDayFromPlaceholder}
                      />
                    );
                  }

                  const dayLabelParts = splitDayLabel(entry.label, dayIndex + 1);
                  const isEditingDayTitle = editingDayTitleDayIndex === dayIndex;

                  return (
                    <ItineraryDaySection
                      key={entry.clientDayId}
                      day={entry}
                      dayIndex={dayIndex}
                      editable={false}
                      dragEnabled={false}
                      dropZoneId={getDayDropZoneId(dayIndex)}
                      onEditItem={openEditItemModal}
                      onDeleteItem={(targetDayIndex, itemIndex, title) =>
                        setConfirmItemDeleteTarget({
                          dayIndex: targetDayIndex,
                          itemIndex,
                          title,
                        })
                      }
                      onAddActivity={openAddActivityModal}
                      onEditDayTitle={startDayTitleInlineEdit}
                      onDeleteDay={(targetDayIndex, dayLabel) =>
                        setConfirmDayDeleteTarget({
                          dayIndex: targetDayIndex,
                          dayLabel,
                        })
                      }
                      dayTitlePrefix={dayLabelParts.prefix}
                      dayTitleDraft={
                        isEditingDayTitle ? editingDayTitleDraft : dayLabelParts.title
                      }
                      isEditingDayTitle={isEditingDayTitle}
                      onDayTitleDraftChange={setEditingDayTitleDraft}
                      onSaveDayTitle={handleSaveDayTitle}
                      onCancelDayTitle={cancelDayTitleInlineEdit}
                    />
                  );
                })
              )}
            </>
          )}

          {editable && !loading && (
            <button
              type="button"
              onClick={handleAddNewDay}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 px-4 py-4 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
            >
              <span className="material-symbols-outlined">add</span>
              Add new day
            </button>
          )}

          <div className="relative">
            <div className="absolute -left-[34px] top-0 flex flex-col items-center" />
          </div>
        </div>
      </div>

      <PackingListPanel />

      <ConfirmOverlay
        open={!!confirmItemDeleteTarget}
        title="Delete item"
        message={
          confirmItemDeleteTarget
            ? `Delete "${confirmItemDeleteTarget.title}" from this trip? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Keep"
        onCancel={() => setConfirmItemDeleteTarget(null)}
        onConfirm={handleConfirmDeleteItem}
      />

      <ConfirmOverlay
        open={!!confirmDayDeleteTarget}
        title="Delete this day?"
        message={
          confirmDayDeleteTarget
            ? `Delete "${confirmDayDeleteTarget.dayLabel}" and all its activities? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setConfirmDayDeleteTarget(null)}
        onConfirm={handleConfirmDeleteDay}
      />

      <EditItineraryItemModal
        open={!!editingItemTarget}
        form={editingItemForm}
        onFormChange={(nextForm) => setEditingItemForm(nextForm)}
        onClose={closeEditItemModal}
        onSave={handleSaveEditedItem}
      />

      <EditItineraryItemModal
        open={addActivityTargetDayIndex !== null}
        form={addActivityForm}
        onFormChange={(nextForm) => setAddActivityForm(nextForm)}
        onClose={closeAddActivityModal}
        onSave={handleSaveAddedActivity}
        title="Add activity"
        description="Add a new activity to this itinerary day."
        saveLabel="Add activity"
      />

    </div>
  );
}
