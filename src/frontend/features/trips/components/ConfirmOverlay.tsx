"use client";

import OverlayModal from "./OverlayModal";

type Props = {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmOverlay({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  busy = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <OverlayModal
      open={open}
      onClose={onCancel}
      title={title}
      description={undefined}
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy && (
              <span className="material-symbols-outlined animate-spin text-base">
                progress_activity
              </span>
            )}
            {confirmLabel}
          </button>
        </div>
      }
    >
      <p className="text-sm text-slate-700">{message}</p>
    </OverlayModal>
  );
}
