"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { ClientItineraryDay, EditableItineraryItem } from "./types";
import ItineraryItemCard from "./ItineraryItemCard";
import SortableItineraryItemCard from "./SortableItineraryItemCard";

type ItineraryDaySectionProps = {
  day: ClientItineraryDay;
  dayIndex: number;
  editable: boolean;
  dragEnabled: boolean;
  dropZoneId: string;
  onEditItem: (
    dayIndex: number,
    itemIndex: number,
    item: EditableItineraryItem,
  ) => void;
  onDeleteItem: (dayIndex: number, itemIndex: number, title: string) => void;
  onAddActivity: (dayIndex: number) => void;
  onEditDayTitle: (dayIndex: number) => void;
  onDeleteDay: (dayIndex: number, dayLabel: string) => void;
  dayTitlePrefix: string;
  dayTitleDraft: string;
  isEditingDayTitle: boolean;
  onDayTitleDraftChange: (nextValue: string) => void;
  onSaveDayTitle: () => void;
  onCancelDayTitle: () => void;
};

export default function ItineraryDaySection({
  day,
  dayIndex,
  editable,
  dragEnabled,
  dropZoneId,
  onEditItem,
  onDeleteItem,
  onAddActivity,
  onEditDayTitle,
  onDeleteDay,
  dayTitlePrefix,
  dayTitleDraft,
  isEditingDayTitle,
  onDayTitleDraftChange,
  onSaveDayTitle,
  onCancelDayTitle,
}: ItineraryDaySectionProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: dropZoneId,
    disabled: !dragEnabled,
  });

  const itemIds = day.items.map((item) => item.clientId);

  return (
    <div className="relative">
      <div className="absolute -left-[34px] top-0 flex flex-col items-center">
        <div
          className={`h-5 w-5 rounded-full border-4 ${
            day.active ? "bg-slate-900 border-white" : "bg-white border-white"
          }`}
        />
      </div>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {isEditingDayTitle ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl font-semibold text-slate-900">
                {dayTitlePrefix}
              </span>
              <input
                type="text"
                value={dayTitleDraft}
                onChange={(event) => onDayTitleDraftChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    onSaveDayTitle();
                  } else if (event.key === "Escape") {
                    onCancelDayTitle();
                  }
                }}
                className="w-full max-w-sm rounded-md border border-slate-300 px-2.5 py-1 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                autoFocus
              />
              <button
                type="button"
                onClick={onSaveDayTitle}
                className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-slate-800"
              >
                Save
              </button>
              <button
                type="button"
                onClick={onCancelDayTitle}
                className="rounded-md px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Cancel
              </button>
            </div>
          ) : (
            <h3 className="text-xl font-semibold text-slate-900">{day.label}</h3>
          )}
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {day.date}
          </p>
        </div>
        {editable && !isEditingDayTitle && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onEditDayTitle(dayIndex)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
              title="Edit day title"
              aria-label="Edit day title"
            >
              <span className="material-symbols-outlined text-base leading-none">
                edit
              </span>
            </button>
            <button
              type="button"
              onClick={() => onDeleteDay(dayIndex, day.label)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-red-600 transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
              title="Delete day"
              aria-label="Delete day"
            >
              <span className="material-symbols-outlined text-base leading-none">
                delete
              </span>
            </button>
          </div>
        )}
      </div>
      <div
        ref={setNodeRef}
        className={`space-y-4 transition-colors duration-200 ${
          dragEnabled && isOver ? "-m-2 rounded-2xl bg-slate-50/80 p-2" : ""
        }`}
      >
        {dragEnabled && isOver && day.items.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white px-3 py-3 text-xs font-semibold text-slate-500">
            Drop activity here
          </div>
        )}

        {dragEnabled ? (
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            {day.items.map((item, itemIndex) => (
              <SortableItineraryItemCard
                key={item.clientId}
                id={item.clientId}
                item={item}
                editable={editable}
                onEdit={() => onEditItem(dayIndex, itemIndex, item)}
                onDelete={() => onDeleteItem(dayIndex, itemIndex, item.title)}
              />
            ))}
          </SortableContext>
        ) : (
          day.items.map((item, itemIndex) => (
            <ItineraryItemCard
              key={item.clientId}
              item={item}
              editable={editable}
              onEdit={() => onEditItem(dayIndex, itemIndex, item)}
              onDelete={() => onDeleteItem(dayIndex, itemIndex, item.title)}
            />
          ))
        )}

        {editable && (
          <button
            type="button"
            onClick={() => onAddActivity(dayIndex)}
            className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            Add activity
          </button>
        )}
      </div>
    </div>
  );
}
