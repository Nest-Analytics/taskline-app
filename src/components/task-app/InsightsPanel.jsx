function StatRow({ label, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-[8px] px-1 py-1.5 text-left transition hover:bg-slate-50"
    >
      <span className="text-[13px] text-slate-500">{label}</span>
      <strong className="text-[13px] font-semibold text-slate-800">{value}</strong>
    </button>
  );
}

function Card({ title, children }) {
  return (
    <section className="rounded-[14px] border border-slate-200 bg-white p-4 shadow-[0_1px_6px_rgba(15,23,42,0.06)]">
      <h3 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-slate-400">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default function InsightsPanel({
  totalCount,
  doneCount,
  openCount,
  overdueCount,
  streakDays,
  onOpenOverdue,
  onOpenCompleted,
}) {
  const rate = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  return (
    <aside className="sticky top-0 space-y-3">
      <Card title="Overview">
        <StatRow label="Total tasks" value={totalCount} />
        <StatRow label="Open" value={openCount} />
        <StatRow label="Completed" value={doneCount} onClick={onOpenCompleted} />
        <StatRow label="Streak" value={`${streakDays} days`} />
        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[12px] text-slate-400">Completion</span>
            <span className="text-[12px] font-semibold text-slate-600">{rate}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100">
            <div
              className="h-1.5 rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${rate}%` }}
            />
          </div>
        </div>
      </Card>

      <Card title="Attention">
        <StatRow
          label="Flagged tasks"
          value={overdueCount}
          onClick={onOpenOverdue}
        />
      </Card>
    </aside>
  );
}
