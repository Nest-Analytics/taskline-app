import { useEffect, useState } from "react";
import TaskComposer from "./TaskComposer.jsx";

export default function EditTaskModal({
  item,
  categoryOptions,
  bucketOptions,
  onUpdateItem,
  onClose,
}) {
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    if (item) {
      setDraft({
        text: item.text,
        category: item.category,
        due: item.due,
        bucket: item.bucket,
        flagged: item.flagged,
      });
    }
  }, [item]);

  useEffect(() => {
    if (!item) return undefined;
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [item, onClose]);

  if (!item || !draft) return null;

  function handleSubmit(e) {
    e.preventDefault();
    const text = draft.text.trim();
    if (!text) return;
    onUpdateItem(item.id, {
      text,
      category: draft.category,
      due: draft.due.trim(),
      bucket: draft.bucket,
      flagged: draft.flagged,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/35 px-4">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <section className="relative z-10 w-full max-w-3xl rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[1.15rem] font-semibold text-slate-950">
              Edit task
            </h3>
            <p className="mt-1 text-[13px] text-slate-500">
              Update the task details below.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] px-3 py-1.5 text-[13px] text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            Close
          </button>
        </div>
        <TaskComposer
          composer={draft}
          categoryOptions={categoryOptions}
          bucketOptions={bucketOptions}
          onComposerChange={setDraft}
          onSubmit={handleSubmit}
          compact={false}
        />
      </section>
    </div>
  );
}
