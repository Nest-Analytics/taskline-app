import { useEffect, useRef } from "react";
import { CalendarIcon, FlagIcon, FolderIcon } from "./Icons.jsx";

export default function NewTaskModal({
  isOpen,
  composer,
  categoryOptions,
  bucketOptions,
  onComposerChange,
  onClose,
  onSubmit,
  submitError,
  submitting,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function update(field, value) {
    onComposerChange((current) => ({ ...current, [field]: value }));
  }

  const canSubmit = !submitting && composer.text.trim().length > 0;
  const bucketLabel = bucketOptions.find((b) => b.value === composer.bucket)?.label ?? composer.bucket;

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-slate-950/40 px-4 pt-24 sm:pt-32">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <section className="relative z-10 w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <form onSubmit={onSubmit}>
          <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <h3 className="text-sm font-semibold text-slate-900">New task</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </header>

          <div className="px-5 pt-5">
            <label htmlFor="new-task-input" className="sr-only">
              Task name
            </label>
            <input
              ref={inputRef}
              id="new-task-input"
              type="text"
              value={composer.text}
              onChange={(e) => update("text", e.target.value)}
              placeholder="What needs to be done?"
              maxLength={180}
              className="w-full border-0 bg-transparent p-0 text-lg font-medium text-slate-900 outline-none placeholder:text-slate-400"
            />
            <div className="mt-1 text-right text-[11px] text-slate-400">
              {composer.text.length}/180
            </div>
          </div>

          <div className="px-5 pb-5">
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus-within:border-slate-400">
                <FolderIcon />
                <span className="sr-only">Category</span>
                <select
                  value={composer.category}
                  onChange={(e) => update("category", e.target.value)}
                  className="w-full bg-transparent text-slate-800 outline-none"
                >
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus-within:border-slate-400">
                <span aria-hidden="true" className="text-slate-400">📋</span>
                <span className="sr-only">List</span>
                <select
                  value={composer.bucket}
                  onChange={(e) => update("bucket", e.target.value)}
                  className="w-full bg-transparent text-slate-800 outline-none"
                >
                  {bucketOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus-within:border-slate-400 sm:col-span-2">
                <CalendarIcon />
                <span className="sr-only">Due</span>
                <input
                  type="text"
                  value={composer.due}
                  onChange={(e) => update("due", e.target.value)}
                  placeholder="Due (e.g. Today, Fri, Apr 20)"
                  maxLength={40}
                  className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => update("flagged", !composer.flagged)}
              className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
                composer.flagged
                  ? "border-red-200 bg-red-50 text-red-600"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              <FlagIcon active={composer.flagged} />
              {composer.flagged ? "Flagged as important" : "Flag as important"}
            </button>

            {submitError ? (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-700">
                {submitError}
              </div>
            ) : null}
          </div>

          <footer className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-3 rounded-b-2xl">
            <span className="text-xs text-slate-500">
              Saving to <span className="font-medium text-slate-700">{bucketLabel}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {submitting ? "Saving…" : "Save task"}
              </button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  );
}
