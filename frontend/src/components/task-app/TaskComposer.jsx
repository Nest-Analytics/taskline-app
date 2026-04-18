import { CalendarIcon, FlagIcon, FolderIcon } from "./Icons.jsx";

export default function TaskComposer({
  composer,
  categoryOptions,
  bucketOptions,
  onComposerChange,
  onSubmit,
  compact = true,
  submitting = false,
}) {
  function update(field, value) {
    onComposerChange((current) => ({ ...current, [field]: value }));
  }

  const wrapperClass = compact
    ? "mt-3 rounded-[14px] border border-slate-200 bg-white px-3.5 py-2.5 shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
    : "mt-5 rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-4";
  const gridClass = compact
    ? "grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_170px_130px_130px_auto_auto] xl:items-center"
    : "grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.7fr)_190px_150px_140px_auto_auto] xl:items-center";

  return (
    <form className={wrapperClass} onSubmit={onSubmit}>
      <div className={gridClass}>
        <input
          id="new-task-input"
          type="text"
          value={composer.text}
          onChange={(event) => update("text", event.target.value)}
          placeholder='"What needs to be done?"'
          maxLength={180}
          className="min-w-0 rounded-[10px] border border-slate-200 bg-white px-3 py-1.5 text-[13px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-300"
        />

        <label className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-3 py-1.5 text-[13px] text-slate-500">
          <FolderIcon />
          <select
            value={composer.category}
            onChange={(event) => update("category", event.target.value)}
            className="w-full bg-transparent text-slate-700 outline-none"
          >
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-3 py-1.5 text-[13px] text-slate-500">
          <CalendarIcon />
          <input
            type="text"
            value={composer.due}
            onChange={(event) => update("due", event.target.value)}
            placeholder="Due"
            maxLength={40}
            className="w-full bg-transparent text-slate-700 outline-none placeholder:text-slate-400"
          />
        </label>

        <select
          value={composer.bucket}
          onChange={(event) => update("bucket", event.target.value)}
          className="rounded-[10px] border border-slate-200 bg-white px-3 py-1.5 text-[13px] text-slate-700 outline-none"
        >
          {bucketOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => update("flagged", !composer.flagged)}
          disabled={submitting}
          className={`flex items-center justify-center gap-2 rounded-[10px] border px-3 py-1.5 text-[12px] font-medium transition ${
            composer.flagged
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-slate-200 text-slate-500 hover:border-slate-300"
          }`}
        >
          <FlagIcon active={composer.flagged} />
          Flag
        </button>

        <div className="flex flex-wrap items-center gap-3 text-slate-500">
          <button
            type="submit"
            disabled={submitting || !composer.text.trim()}
            className="rounded-[10px] bg-slate-900 px-3 py-1.5 text-[12px] font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting ? "Saving..." : "Save task"}
          </button>
          <span className="text-[11px] text-slate-400">
            {composer.text.length}/180
          </span>
        </div>
      </div>
    </form>
  );
}
