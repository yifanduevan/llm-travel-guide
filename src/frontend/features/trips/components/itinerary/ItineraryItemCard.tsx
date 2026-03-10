"use client";

import type { ItineraryItem } from "@/features/trips/itineraryTypes";

type ItineraryItemCardProps = {
  item: ItineraryItem;
  editable: boolean;
  onEdit: () => void;
  onDelete: () => void;
  dragEnabled?: boolean;
  isDragging?: boolean;
  className?: string;
};

export default function ItineraryItemCard({
  item,
  editable,
  onEdit,
  onDelete,
  dragEnabled = false,
  isDragging = false,
  className = "",
}: ItineraryItemCardProps) {
  return (
    <div
      className={`flex gap-4 rounded-2xl border-white bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md ${
        item.muted ? "opacity-70" : ""
      } ${dragEnabled ? "cursor-grab active:cursor-grabbing select-none" : ""} ${
        isDragging ? "opacity-90 shadow-xl ring-2 ring-slate-200" : ""
      } ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
        <span className="material-symbols-outlined">{item.icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-semibold text-slate-900">{item.title}</h4>
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
      <div className="flex shrink-0 flex-col items-end gap-2 pl-2">
        <span className="whitespace-nowrap rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {item.time}
        </span>
        {editable && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onEdit}
              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
              title="Edit item"
              aria-label="Edit item"
            >
              <span className="material-symbols-outlined text-base leading-none">
                edit
              </span>
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="flex h-7 w-7 items-center justify-center rounded-full text-red-600 transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
              title="Delete item"
              aria-label="Delete item"
            >
              <span className="material-symbols-outlined text-base leading-none">
                delete
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
