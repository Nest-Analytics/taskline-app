import { useEffect, useState } from "react";
import Sidebar from "./components/task-app/Sidebar.jsx";
import Topbar from "./components/task-app/Topbar.jsx";
import TaskFilters from "./components/task-app/TaskFilters.jsx";
import TaskTable from "./components/task-app/TaskTable.jsx";
import InsightsPanel from "./components/task-app/InsightsPanel.jsx";
import SettingsPanel from "./components/task-app/SettingsPanel.jsx";
import NewTaskModal from "./components/task-app/NewTaskModal.jsx";
import EditTaskModal from "./components/task-app/EditTaskModal.jsx";
import useTaskState from "./hooks/useTaskState.js";
import {
  APP_NAME, BUCKET_OPTIONS, CATEGORY_OPTIONS, DEFAULT_SETTINGS,
  SECTION_META, SIDEBAR_ITEMS, formatDateText, getSidebarCount,
} from "./components/task-app/data.js";

export default function TaskApp({ onLogout }) {
  const {
    items, settings, setSettings,
    notifications, unreadCount, setUnreadCount,
    addItem, toggleItem, toggleFlag, deleteItem, updateItem,
    clearCompleted, restoreDemoTasks,
  } = useTaskState();

  const [composer, setComposer] = useState({
    text: "",
    category: DEFAULT_SETTINGS.defaultCategory,
    due: DEFAULT_SETTINGS.defaultDue,
    bucket: DEFAULT_SETTINGS.defaultBucket,
    flagged: false,
  });
  const [search, setSearch] = useState("");
  const [section, setSection] = useState("all");
  const [filters, setFilters] = useState({ status: "all", category: "all", bucket: "all" });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    setComposer((c) => ({
      ...c,
      category: c.text ? c.category : settings.defaultCategory,
      due: c.text ? c.due : settings.defaultDue,
      bucket: c.text ? c.bucket : settings.defaultBucket,
    }));
  }, [settings.defaultBucket, settings.defaultCategory, settings.defaultDue]);

  const visibleItems = items.filter((item) => {
    const inSection = section === "all" ? true : section === "done" ? item.done : item.bucket === section;
    const inStatus = filters.status === "flagged" ? item.flagged && !item.done
      : filters.status === "open" ? !item.done
      : filters.status === "done" ? item.done : true;
    const inCategory = filters.category === "all" ? true : item.category === filters.category;
    const inBucket = filters.bucket === "all" ? true : item.bucket === filters.bucket;
    const hay = [item.text, item.category, item.due, item.bucket].join(" ").toLowerCase();
    return inSection && inStatus && inCategory && inBucket && hay.includes(search.toLowerCase());
  });

  const totalCount = items.length;
  const doneCount = items.filter((i) => i.done).length;
  const openCount = items.filter((i) => !i.done).length;
  const overdueCount = items.filter((i) => i.flagged && !i.done).length;
  const activeSection = SECTION_META[section] || SECTION_META.all;

  function handleNewTask(event) {
    event.preventDefault();
    const text = composer.text.trim();
    if (!text) return;
    addItem({ text, category: composer.category, due: composer.due.trim() || "", flagged: composer.flagged, bucket: composer.bucket });
    setComposer({ text: "", category: settings.defaultCategory, due: settings.defaultDue, bucket: settings.defaultBucket, flagged: false });
    setNewTaskOpen(false);
  }

  function handleStartNewTask() {
    setSection("today");
    setFilters({ status: "all", category: "all", bucket: "all" });
    setSearch("");
    setNewTaskOpen(true);
  }

  function handleToggleNotifications() {
    setNotificationsOpen((v) => { if (!v) setUnreadCount(0); return !v; });
  }

  function handleOpenOverdue() {
    setSection("all");
    setSearch("");
    setFilters((c) => ({ ...c, status: "flagged" }));
  }

  return (
    <main className="h-screen overflow-hidden bg-[#eef3f7] text-slate-900">
      <div className="grid h-screen lg:grid-cols-[260px_minmax(0,1fr)]">
        <Sidebar
          appName={settings.workspaceName || APP_NAME}
          ownerName={settings.ownerName}
          items={items}
          navItems={SIDEBAR_ITEMS}
          section={section}
          onSectionChange={setSection}
          getCount={getSidebarCount}
          onOpenSettings={() => setSettingsOpen(true)}
        />
        <section className="flex h-screen min-h-0 flex-col bg-[#eef3f7]">
          <Topbar
            ownerName={settings.ownerName}
            notifications={notifications}
            unreadCount={unreadCount}
            notificationsOpen={notificationsOpen}
            onToggleNotifications={handleToggleNotifications}
            onCloseNotifications={() => setNotificationsOpen(false)}
            onOpenSettings={() => { setNotificationsOpen(false); setSettingsOpen(true); }}
            onLogout={onLogout}
            search={search}
            onSearchChange={setSearch}
          />
          <div className="min-h-0 flex-1 overflow-hidden">
            <div className="grid h-full gap-4 px-5 py-4 xl:grid-cols-[minmax(0,1fr)_220px]">
              <section className="flex min-h-0 flex-col">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-slate-950">
                      {activeSection.title}
                    </h2>
                    <p className="mt-0.5 text-[13px] text-slate-500">
                      {formatDateText()} · {activeSection.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartNewTask}
                    className="shrink-0 rounded-[10px] bg-[linear-gradient(180deg,#4492ff_0%,#2170eb_100%)] px-3.5 py-1.5 text-[12px] font-medium text-white shadow-[0_6px_14px_rgba(32,112,235,0.16)] transition hover:brightness-105"
                  >
                    + New Task
                  </button>
                </div>
                <TaskFilters
                  filters={filters}
                  categoryOptions={CATEGORY_OPTIONS}
                  bucketOptions={BUCKET_OPTIONS}
                  onChange={setFilters}
                  onReset={() => setFilters({ status: "all", category: "all", bucket: "all" })}
                />
                <TaskTable
                  items={visibleItems}
                  categoryOptions={CATEGORY_OPTIONS}
                  bucketOptions={BUCKET_OPTIONS}
                  onToggleItem={toggleItem}
                  onToggleFlag={toggleFlag}
                  onDeleteItem={deleteItem}
                  onEditItem={setEditingItem}
                  emptyTitle={activeSection.emptyTitle}
                  emptyDescription={activeSection.emptyDescription}
                />
              </section>
              <div className="min-h-0">
                <InsightsPanel
                  totalCount={totalCount}
                  doneCount={doneCount}
                  openCount={openCount}
                  overdueCount={overdueCount}
                  streakDays={5}
                  onOpenCompleted={() => setSection("done")}
                  onOpenOverdue={handleOpenOverdue}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
      <SettingsPanel
        isOpen={settingsOpen}
        settings={settings}
        categoryOptions={CATEGORY_OPTIONS}
        bucketOptions={BUCKET_OPTIONS}
        onChange={setSettings}
        onClose={() => setSettingsOpen(false)}
        onResetDemo={restoreDemoTasks}
        onClearCompleted={clearCompleted}
      />
      <NewTaskModal
        isOpen={newTaskOpen}
        composer={composer}
        categoryOptions={CATEGORY_OPTIONS}
        bucketOptions={BUCKET_OPTIONS}
        onComposerChange={setComposer}
        onClose={() => setNewTaskOpen(false)}
        onSubmit={handleNewTask}
      />
      <EditTaskModal
        key={editingItem?.id}
        item={editingItem}
        categoryOptions={CATEGORY_OPTIONS}
        bucketOptions={BUCKET_OPTIONS}
        onUpdateItem={updateItem}
        onClose={() => setEditingItem(null)}
      />
    </main>
  );
}
