const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "open", label: "Open" },
  { value: "done", label: "Done" },
  { value: "flagged", label: "Flagged" },
];

export default function TaskFilters({
  filters,
  categoryOptions,
  bucketOptions,
  onChange,
  onReset,
}) {
  function update(field, value) {
    onChange((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <select
        value={filters.status}
        onChange={(event) => update("status", event.target.value)}
        className="rounded-[10px] border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700 outline-none"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={filters.category}
        onChange={(event) => update("category", event.target.value)}
        className="rounded-[10px] border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700 outline-none"
      >
        <option value="all">All projects</option>
        {categoryOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <select
        value={filters.bucket}
        onChange={(event) => update("bucket", event.target.value)}
        className="rounded-[10px] border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700 outline-none"
      >
        <option value="all">All lists</option>
        {bucketOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={onReset}
        className="rounded-[10px] border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
      >
        Reset filters
      </button>
    </div>
  );
}
