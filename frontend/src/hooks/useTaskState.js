import { useEffect, useState } from "react";
import { APP_NAME, DEFAULT_SETTINGS } from "../components/task-app/data.js";
import { getAppConfig } from "../runtime-config.js";

const randomUUID = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `note-${Math.random().toString(16).slice(2)}`;

const makeNote = (label, value) => ({ id: randomUUID(), label, value });

async function jsonFetch(url, options) {
  const baseUrl = getAppConfig().apiBaseUrl || "";
  const response = await fetch(`${baseUrl}${url}`, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export default function useTaskState() {
  const [items, setItems] = useState([]);
  const [settingsState, setSettingsState] = useState(DEFAULT_SETTINGS);
  const [notifications, setNotifications] = useState(() => [
    makeNote("Welcome", "Your workspace is ready."),
  ]);
  const [unreadCount, setUnreadCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = settingsState.workspaceName || APP_NAME;
  }, [settingsState.workspaceName]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const data = await jsonFetch("/api/bootstrap");
        if (cancelled) return;
        setItems(data.tasks || []);
        setSettingsState((current) => ({ ...current, ...(data.settings || {}) }));
        setNotifications((current) =>
          current[0]?.label === "Welcome" && current.length === 1
            ? current
            : [makeNote("Welcome", "Your workspace is ready."), ...current].slice(0, 8),
        );
        setError("");
      } catch (loadError) {
        if (!cancelled) setError(loadError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function push(label, value) {
    setNotifications((current) => [makeNote(label, value), ...current].slice(0, 8));
    setUnreadCount((current) => current + 1);
  }

  async function addItem(data) {
    const result = await jsonFetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setItems((current) => [result.task, ...current]);
    push("Task created", `"${result.task.text}" was added to ${result.task.bucket}.`);
  }

  async function toggleItem(id) {
    const currentTask = items.find((item) => item.id === id);
    if (!currentTask) return;
    const result = await jsonFetch(`/api/tasks/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        done: !currentTask.done,
        bucket: currentTask.bucket,
      }),
    });
    setItems((current) => current.map((item) => (item.id === id ? result.task : item)));
    push(
      result.task.done ? "Task completed" : "Task reopened",
      `"${result.task.text}" is now ${result.task.done ? "done" : "active"}.`,
    );
  }

  async function toggleFlag(id) {
    const currentTask = items.find((item) => item.id === id);
    if (!currentTask) return;
    const result = await jsonFetch(`/api/tasks/${id}/flag`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flagged: !currentTask.flagged }),
    });
    setItems((current) => current.map((item) => (item.id === id ? result.task : item)));
    push(
      result.task.flagged ? "Task flagged" : "Task unflagged",
      `"${result.task.text}" was ${result.task.flagged ? "flagged" : "updated"}.`,
    );
  }

  async function deleteItem(id) {
    const currentTask = items.find((item) => item.id === id);
    if (!currentTask) return;
    await jsonFetch(`/api/tasks/${id}`, { method: "DELETE" });
    setItems((current) => current.filter((item) => item.id !== id));
    push("Task deleted", `"${currentTask.text}" was removed.`);
  }

  async function updateItem(id, updates) {
    const result = await jsonFetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setItems((current) => current.map((item) => (item.id === id ? result.task : item)));
    push("Task updated", `"${result.task.text}" was updated.`);
  }

  async function clearCompleted() {
    const completedCount = items.filter((item) => item.done).length;
    const result = await jsonFetch("/api/tasks/clear-completed", { method: "POST" });
    setItems(result.tasks || []);
    if (completedCount > 0) push("Completed cleared", `${completedCount} completed tasks were removed.`);
  }

  async function saveSettings(next) {
    const result = await jsonFetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    setSettingsState((current) => ({ ...current, ...(result.settings || next) }));
    push("Settings updated", "Your workspace preferences were saved.");
    return result.settings;
  }

  return {
    items,
    settings: settingsState,
    saveSettings,
    notifications,
    unreadCount,
    setUnreadCount,
    addItem,
    toggleItem,
    toggleFlag,
    deleteItem,
    updateItem,
    clearCompleted,
    loading,
    error,
  };
}
