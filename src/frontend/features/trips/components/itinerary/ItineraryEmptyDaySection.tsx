"use client";

import { useDroppable } from "@dnd-kit/core";
import type { EmptyDayPlaceholder } from "./types";

type ItineraryEmptyDaySectionProps = {
  entry: EmptyDayPlaceholder;
  dayIndex: number;
  editable: boolean;
  dropZoneId: string;
  onAddDay: (dayIndex: number) => void;
};

export default function ItineraryEmptyDaySection({
  entry,
  dayIndex,
  editable,
  dropZoneId,
  onAddDay,
}: ItineraryEmptyDaySectionProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: dropZoneId,
    disabled: !editable,
  });

  return (
    <div className="relative">
      <div className="absolute -left-[34px] top-0 flex flex-col items-center">
        <div className="h-5 w-5 rounded-full border-4 border-white bg-white" />
      </div>

      <div className="mb-4">
        <h3 className="text-xl font-semibold text-slate-900">Day {entry.dayNumber}</h3>
      </div>

      <div
        ref={setNodeRef}
        className={`rounded-2xl border-2 border-dashed p-4 transition-colors duration-200 ${
          editable && isOver
            ? "border-slate-400 bg-slate-100"
            : "border-slate-200 bg-slate-50"
        }`}
      >
        {editable && isOver && (
          <div className="mb-3 rounded-lg border border-dashed border-slate-400 bg-white px-3 py-2 text-xs font-semibold text-slate-500">
            Drop activity here
          </div>
        )}

        <p className="text-sm text-slate-600">(No activities)</p>

        {editable && (
          <button
            type="button"
            onClick={() => onAddDay(dayIndex)}
            className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            Add Day {entry.dayNumber}
          </button>
        )}
      </div>
    </div>
  );
}
