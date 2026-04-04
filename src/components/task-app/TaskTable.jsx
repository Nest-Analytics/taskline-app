import TaskRow from "./TaskRow.jsx";

function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl">
        ✓
      </div>
      <p className="text-[15px] font-semibold text-slate-700">{title}</p>
      <p className="mt-1 text-[13px] text-slate-400">{description}</p>
    </div>
  );
}

export default function TaskTable({
  items,
  onToggleItem,
  onToggleFlag,
  onDeleteItem,
  onEditItem,
  emptyTitle,
  emptyDescription,
}) {
  return (
    <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-[0_1px_6px_rgba(15,23,42,0.06)]">
      <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_160px_80px_96px] border-b border-slate-100 bg-slate-50/70 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        <span>Task</span>
        <span>Project</span>
        <span>Due</span>
        <span>Actions</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          items.map((item, index) => (
            <TaskRow
              key={item.id}
              item={item}
              isLast={index === items.length - 1}
              onToggleItem={onToggleItem}
              onToggleFlag={onToggleFlag}
              onDeleteItem={onDeleteItem}
              onEditItem={onEditItem}
            />
          ))
        )}
      </div>
    </div>
  );
}
