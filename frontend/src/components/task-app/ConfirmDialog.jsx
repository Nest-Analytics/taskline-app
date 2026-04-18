import { useEffect } from "react";

export default function ConfirmDialog({
  isOpen,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  destructive = true,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;
    function handleKey(e) {
      if (e.key === "Escape") onCancel?.();
      if (e.key === "Enter") onConfirm?.();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onCancel, onConfirm]);

  if (!isOpen) return null;

  const confirmClass = destructive
    ? "bg-red-600 hover:bg-red-700"
    : "bg-blue-600 hover:bg-blue-700";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 px-4"
    >
      <div className="absolute inset-0" onClick={onCancel} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="px-5 pt-5">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                destructive ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
              }`}
            >
              {destructive ? "!" : "?"}
            </span>
            <div>
              <h3 id="confirm-title" className="text-sm font-semibold text-slate-900">
                {title}
              </h3>
              {message ? (
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{message}</p>
              ) : null}
            </div>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-3 rounded-b-2xl">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-200"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
