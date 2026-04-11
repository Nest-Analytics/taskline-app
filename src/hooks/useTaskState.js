import { useEffect, useState } from "react";
import {
  APP_NAME,
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  STARTER_TASKS,
  STORAGE_KEY,
} from "../components/task-app/data.js";

const randomUUID = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      });

const makeNote = (label, value) => ({ id: randomUUID(), label, value });
const isServerBackedTask = (id) => typeof id === "string" && id.startsWith("t_");

function loadItems() {
  if (typeof window === "undefined") return STARTER_TASKS;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return STARTER_TASKS;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : STARTER_TASKS;
  } catch { return STARTER_TASKS; }
}

function loadSettings() {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch { return DEFAULT_SETTINGS; }
}

export default function useTaskState() {
  const [items, setItems] = useState(() => loadItems());
  const [settings, setSettings] = useState(() => loadSettings());
  const [notifications, setNotifications] = useState(() => [
    makeNote("Welcome", "Your workspace is ready."),
  ]);
  const [unreadCount, setUnreadCount] = useState(1);

  useEffect(() => {
    document.title = settings.workspaceName || APP_NAME;
  }, [settings.workspaceName]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  function push(label, value) {
    setNotifications((c) => [makeNote(label, value), ...c].slice(0, 8));
    setUnreadCount((c) => c + 1);
  }

  async function addItem(data) {
    let id = randomUUID();
    try {
      const res = await fetch("/api/demo/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: data.text }),
      });
      if (res.ok) {
        const task = await res.json();
        id = task.id;
      }
    } catch {
      // Fall back to local-only task ids when the demo API is unavailable.
    }
    setItems((c) => [{ id, done: false, ...data }, ...c]);
    push("Task created", `"${data.text}" was added to ${data.bucket}.`);
  }

  async function toggleItem(id) {
    const current = items.find((item) => item.id === id);
    if (!current) return;
    const next = !current.done;
    setItems((c) => c.map((item) => {
      if (item.id !== id) return item;
      push(next ? "Task completed" : "Task reopened", `"${item.text}" is now ${next ? "done" : "active"}.`);
      return { ...item, done: next };
    }));
    if (!isServerBackedTask(id)) return;
    try {
      await fetch(`/api/demo/tasks/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next ? "done" : "open" }),
      });
    } catch {
      push("Sync delayed", `"${current.text}" changed locally but the demo API did not respond.`);
    }
  }

  function toggleFlag(id) {
    setItems((c) => c.map((item) => {
      if (item.id !== id) return item;
      const next = !item.flagged;
      push(next ? "Task flagged" : "Task unflagged", `"${item.text}" was ${next ? "flagged" : "updated"}.`);
      return { ...item, flagged: next };
    }));
  }

  function deleteItem(id) {
    setItems((c) => {
      const t = c.find((i) => i.id === id);
      if (t) push("Task deleted", `"${t.text}" was removed.`);
      return c.filter((i) => i.id !== id);
    });
  }

  function updateItem(id, updates) {
    setItems((c) => {
      const t = c.find((i) => i.id === id);
      if (t) push("Task updated", `"${updates.text || t.text}" was updated.`);
      return c.map((i) => (i.id === id ? { ...i, ...updates } : i));
    });
  }

  function clearCompleted() {
    setItems((c) => {
      const n = c.filter((i) => i.done).length;
      if (n > 0) push("Completed cleared", `${n} completed tasks were removed.`);
      return c.filter((i) => !i.done);
    });
  }

  function restoreDemoTasks() {
    setItems(STARTER_TASKS);
    push("Demo restored", "Starter tasks were restored.");
  }

  return {
    items, settings, setSettings,
    notifications, unreadCount, setUnreadCount,
    addItem, toggleItem, toggleFlag,
    deleteItem, updateItem, clearCompleted, restoreDemoTasks,
  };
}
