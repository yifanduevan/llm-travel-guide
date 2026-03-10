"use client";

import { DateTimePicker } from "../DateTimePicker";
import OverlayModal from "../OverlayModal";

export type TransportSegmentEditForm = {
  title: string;
  type: string;
  startTime: string;
  startLocation: string;
  endTime: string;
  endLocation: string;
  status: string;
  confirmationCode: string;
  ticketUrl: string;
};

type EditSegmentModalProps = {
  open: boolean;
  form: TransportSegmentEditForm;
  error?: string | null;
  onFormChange: (nextForm: TransportSegmentEditForm) => void;
  onClose: () => void;
  onSave: () => void;
};

const transportTypeOptions = [
  { value: "FLIGHT", label: "Flight" },
  { value: "TRAIN", label: "Train" },
  { value: "CAR", label: "Car" },
  { value: "BUS", label: "Bus" },
  { value: "SHIP", label: "Ship" },
  { value: "WALKING", label: "Walking" },
  { value: "OTHER", label: "Other" },
] as const;

const transportStatusOptions = [
  { value: "PLANNED", label: "Planned" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

export default function EditSegmentModal({
  open,
  form,
  error,
  onFormChange,
  onClose,
  onSave,
}: EditSegmentModalProps) {
  return (
    <OverlayModal
      open={open}
      onClose={onClose}
      title="Edit transport segment"
      description="Update segment details for this trip."
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
            Save
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Title
            </span>
            <input
              value={form.title}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  title: event.target.value,
                })
              }
              placeholder="SFO -> JFK"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Type
            </span>
            <select
              value={form.type}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  type: event.target.value,
                })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
            >
              {transportTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Departure time
            </span>
            <DateTimePicker
              value={form.startTime}
              onChange={(nextValue) =>
                onFormChange({
                  ...form,
                  startTime: nextValue,
                })
              }
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Arrival time
            </span>
            <DateTimePicker
              value={form.endTime}
              onChange={(nextValue) =>
                onFormChange({
                  ...form,
                  endTime: nextValue,
                })
              }
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Departure location
            </span>
            <input
              value={form.startLocation}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  startLocation: event.target.value,
                })
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
              value={form.endLocation}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  endLocation: event.target.value,
                })
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
              value={form.status}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  status: event.target.value,
                })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
            >
              {transportStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Confirmation number
            </span>
            <input
              value={form.confirmationCode}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  confirmationCode: event.target.value,
                })
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
              value={form.ticketUrl}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  ticketUrl: event.target.value,
                })
              }
              placeholder="https://tickets..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
            />
          </label>
        </div>
      </div>
    </OverlayModal>
  );
}
