import { useEffect, useState } from "react";
import ConfirmDialog from "./ConfirmDialog.jsx";

function arraysEqual(a, b) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  return a.every((item, idx) => item === b[idx]);
}

function draftEquals(a, b) {
  return (
    a.workspaceName === b.workspaceName &&
    a.ownerName === b.ownerName &&
    a.defaultCategory === b.defaultCategory &&
    a.defaultBucket === b.defaultBucket &&
    a.defaultDue === b.defaultDue &&
    arraysEqual(a.projects, b.projects)
  );
}

export default function SettingsPanel({
  isOpen,
  settings,
  bucketOptions,
  onSave,
  onClose,
  onClearCompleted,
}) {
  const [draft, setDraft] = useState(settings);
  const [isEditing, setIsEditing] = useState(false);
  const [newProject, setNewProject] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  // Whenever the panel reopens, or the persisted settings change while we
  // aren't mid-edit, reset the draft so stale local edits don't stick around.
  useEffect(() => {
    if (!isOpen || !isEditing) setDraft(settings);
  }, [isOpen, isEditing, settings]);

  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setNewProject("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const projects = draft.projects || [];

  function update(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function handleEdit() {
    setDraft(settings);
    setIsEditing(true);
    setError("");
  }

  function handleCancel() {
    setDraft(settings);
    setIsEditing(false);
    setNewProject("");
    setError("");
  }

  async function handleSave() {
    if (draftEquals(draft, settings)) {
      setIsEditing(false);
      return;
    }
    try {
      setSaving(true);
      setError("");
      await onSave(draft);
      setIsEditing(false);
      setNewProject("");
    } catch (saveError) {
      setError(saveError.message || "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  function handleAddProject(event) {
    event?.preventDefault();
    const name = newProject.trim();
    if (!name) return;
    if (projects.some((p) => p.toLowerCase() === name.toLowerCase())) {
      setError(`"${name}" already exists.`);
      return;
    }
    setDraft((current) => ({
      ...current,
      projects: [...(current.projects || []), name],
    }));
    setNewProject("");
    setError("");
  }

  function confirmRemoveProject() {
    if (!projectToDelete) return;
    setDraft((current) => {
      const nextProjects = (current.projects || []).filter((p) => p !== projectToDelete);
      // Keep defaultCategory valid — drop back to the first remaining project
      // (or clear the default if the list ends up empty).
      const nextDefault = nextProjects.includes(current.defaultCategory)
        ? current.defaultCategory
        : nextProjects[0] || "";
      return { ...current, projects: nextProjects, defaultCategory: nextDefault };
    });
    setProjectToDelete(null);
  }

  const inputClass = (readonly) =>
    `w-full rounded-[12px] border px-3 py-2.5 text-sm outline-none transition ${
      readonly
        ? "border-slate-200 bg-slate-50 text-slate-700 cursor-default"
        : "border-slate-300 bg-white text-slate-900 focus:border-slate-500"
    }`;

  return (
    <>
      <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/30 backdrop-blur-[2px]">
        <section className="flex h-full w-full max-w-md flex-col bg-white shadow-[0_12px_40px_rgba(15,23,42,0.18)]">
          <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Settings</h3>
              <p className="mt-1 text-sm text-slate-500">
                {isEditing ? "Make your changes and save." : "Workspace preferences and defaults."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="rounded-[10px] px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-[10px] bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-[10px] px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </header>

          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            {error ? (
              <div className="rounded-[12px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Workspace name</span>
              <input
                type="text"
                value={draft.workspaceName || ""}
                onChange={(event) => update("workspaceName", event.target.value)}
                readOnly={!isEditing}
                className={inputClass(!isEditing)}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Owner name</span>
              <input
                type="text"
                value={draft.ownerName || ""}
                onChange={(event) => update("ownerName", event.target.value)}
                readOnly={!isEditing}
                className={inputClass(!isEditing)}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Default project</span>
              <select
                value={draft.defaultCategory || ""}
                onChange={(event) => update("defaultCategory", event.target.value)}
                disabled={!isEditing || projects.length === 0}
                className={inputClass(!isEditing)}
              >
                {projects.length === 0 ? (
                  <option value="">No projects yet</option>
                ) : (
                  projects.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))
                )}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Default list</span>
              <select
                value={draft.defaultBucket}
                onChange={(event) => update("defaultBucket", event.target.value)}
                disabled={!isEditing}
                className={inputClass(!isEditing)}
              >
                {bucketOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Default due</span>
              <input
                type="text"
                value={draft.defaultDue || ""}
                onChange={(event) => update("defaultDue", event.target.value)}
                readOnly={!isEditing}
                className={inputClass(!isEditing)}
              />
            </label>

            <div className="rounded-[14px] border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">Projects</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Used as categories on tasks. {projects.length}/50
                  </p>
                </div>
              </div>

              <ul className="mt-3 space-y-1.5">
                {projects.length === 0 ? (
                  <li className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
                    No projects yet — add one below.
                  </li>
                ) : (
                  projects.map((project) => (
                    <li
                      key={project}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-sm text-slate-700"
                    >
                      <span className="truncate">{project}</span>
                      {isEditing ? (
                        <button
                          type="button"
                          onClick={() => setProjectToDelete(project)}
                          className="ml-3 rounded-md px-2 py-0.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      ) : null}
                    </li>
                  ))
                )}
              </ul>

              {isEditing ? (
                <form onSubmit={handleAddProject} className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={newProject}
                    onChange={(event) => setNewProject(event.target.value)}
                    placeholder="Add a project…"
                    maxLength={40}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                  <button
                    type="submit"
                    disabled={!newProject.trim() || projects.length >= 50}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Add
                  </button>
                </form>
              ) : null}
            </div>

            <div className="rounded-[14px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-800">Utilities</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setClearConfirmOpen(true)}
                  className="rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Clear completed
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <ConfirmDialog
        isOpen={!!projectToDelete}
        title="Delete project?"
        message={
          projectToDelete
            ? `"${projectToDelete}" will be removed from your project list. Tasks already tagged with it keep that label — you can retag them manually.`
            : ""
        }
        confirmLabel="Delete project"
        onConfirm={confirmRemoveProject}
        onCancel={() => setProjectToDelete(null)}
      />

      <ConfirmDialog
        isOpen={clearConfirmOpen}
        title="Clear all completed tasks?"
        message="This permanently removes every task that's marked done. This can't be undone."
        confirmLabel="Clear completed"
        onConfirm={() => {
          setClearConfirmOpen(false);
          onClearCompleted?.();
        }}
        onCancel={() => setClearConfirmOpen(false)}
      />
    </>
  );
}
