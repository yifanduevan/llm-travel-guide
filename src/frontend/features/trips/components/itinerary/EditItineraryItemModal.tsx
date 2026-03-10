"use client";

import OverlayModal from "../OverlayModal";
import ItineraryTimePicker from "./ItineraryTimePicker";
import type { EditingItemForm } from "./types";

type EditItineraryItemModalProps = {
  open: boolean;
  form: EditingItemForm;
  onFormChange: (nextForm: EditingItemForm) => void;
  onClose: () => void;
  onSave: () => void;
  title?: string;
  description?: string;
  saveLabel?: string;
};

export default function EditItineraryItemModal({
  open,
  form,
  onFormChange,
  onClose,
  onSave,
  title = "Edit itinerary item",
  description = "Update the selected itinerary item details.",
  saveLabel = "Save",
}: EditItineraryItemModalProps) {
  return (
    <OverlayModal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold btn-primary"
            onClick={onSave}
          >
            {saveLabel}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <label className="space-y-2 text-sm text-slate-700">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Title
          </span>
          <input
            type="text"
            value={form.title}
            onChange={(e) =>
              onFormChange({
                ...form,
                title: e.target.value,
              })
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
          />
        </label>

        <div className="space-y-2 text-sm text-slate-700">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Time
          </p>
          <ItineraryTimePicker
            value={form.time}
            onChange={(nextTime) =>
              onFormChange({
                ...form,
                time: nextTime,
              })
            }
          />
        </div>

        <label className="space-y-2 text-sm text-slate-700">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Note
          </span>
          <textarea
            rows={4}
            value={form.note}
            onChange={(e) =>
              onFormChange({
                ...form,
                note: e.target.value,
              })
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
          />
        </label>
      </div>
    </OverlayModal>
  );
}
