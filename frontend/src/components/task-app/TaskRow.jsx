import { CATEGORY_STYLES } from "./data.js";
import { CheckMarkCircle, FlagIcon, PencilIcon, TrashIcon } from "./Icons.jsx";

export default function TaskRow({
  item,
  isLast,
  onToggleItem,
  onToggleFlag,
  onDeleteItem,
  onEditItem,
}) {
  return (
    <article
      className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5 transition hover:bg-slate-50/60 ${
        isLast ? "" : "border-b border-slate-100"
      }`}
    >
      <button
        type="button"
        onClick={() => onToggleItem(item.id)}
        className="text-slate-400 transition hover:text-sky-500"
        aria-label={item.done ? "Mark task as active" : "Mark task as done"}
      >
        <CheckMarkCircle checked={item.done} />
      </button>

      <div className="grid min-w-0 gap-2 xl:grid-cols-[minmax(0,1fr)_160px_80px] xl:items-center">
        <p
          className={`min-w-0 truncate pr-2 text-[14px] font-medium ${
            item.done ? "text-slate-400 line-through" : "text-slate-900"
          }`}
        >
          {item.text}
        </p>
        <span
          className={`w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
            CATEGORY_STYLES[item.category] || CATEGORY_STYLES.General
          }`}
        >
          {item.category}
        </span>
        <span className="text-[13px] text-slate-500">{item.due || ""}</span>
      </div>

      <div className="flex items-center gap-2 text-slate-300">
        <button
          type="button"
          onClick={() => onToggleFlag(item.id)}
          className="transition hover:text-red-500"
          aria-label="Toggle task flag"
        >
          <FlagIcon active={item.flagged} />
        </button>
        <button
          type="button"
          onClick={() => onEditItem(item)}
          className="transition hover:text-slate-600"
          aria-label="Edit task"
        >
          <PencilIcon />
        </button>
        <button
          type="button"
          onClick={() => onDeleteItem(item.id)}
          className="transition hover:text-slate-600"
          aria-label="Delete task"
        >
          <TrashIcon />
        </button>
      </div>
    </article>
  );
}
