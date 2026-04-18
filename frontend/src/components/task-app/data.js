import { getAppConfig } from "../../runtime-config.js";

const APP = getAppConfig();

export const APP_NAME = APP.appTitle || "Taskline";
export const STORAGE_KEY = "todo-app-items-v3";
export const SETTINGS_STORAGE_KEY = "taskline-settings-v1";

export const SIDEBAR_ITEMS = [
  { id: "all", label: "My Tasks" },
  { id: "inbox", label: "Inbox" },
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "done", label: "Completed" },
];

export const SECTION_META = {
  all: {
    title: "My Tasks",
    description: "Everything in your workspace",
    emptyTitle: "No tasks yet",
    emptyDescription: "Add a task to get your workspace moving.",
  },
  inbox: {
    title: "Inbox",
    description: "Unsorted work waiting for a decision",
    emptyTitle: "Inbox is clear",
    emptyDescription: "New items will appear here until you sort them.",
  },
  today: {
    title: "Today",
    description: "What needs attention right now",
    emptyTitle: "Nothing due today",
    emptyDescription: "You can focus elsewhere or add a new priority.",
  },
  upcoming: {
    title: "Upcoming",
    description: "Tasks planned for later",
    emptyTitle: "No upcoming tasks",
    emptyDescription: "Schedule future work to keep the pipeline visible.",
  },
  done: {
    title: "Completed",
    description: "Finished work across the workspace",
    emptyTitle: "Nothing completed yet",
    emptyDescription: "Completed tasks will show up here.",
  },
};

export const CATEGORY_OPTIONS = [
  "General",
  "Marketing",
  "Website Redesign",
  "Sales",
  "Product",
  "Q4 Planning",
  "Engineering",
];

export const BUCKET_OPTIONS = [
  { value: "inbox", label: "Inbox" },
  { value: "today", label: "Today" },
  { value: "upcoming", label: "Upcoming" },
];

export const DEFAULT_SETTINGS = {
  workspaceName: APP_NAME,
  ownerName: "Alice Johnson",
  defaultCategory: CATEGORY_OPTIONS[0],
  defaultBucket: BUCKET_OPTIONS[1].value,
  defaultDue: "Today",
};

export const STARTER_TASKS = [
  { id: "task-1", text: "Product launch roadmap", done: false, category: "Marketing", due: "Today", flagged: true, bucket: "today" },
  { id: "task-2", text: "Review design mockups", done: false, category: "Website Redesign", due: "4 PM", flagged: false, bucket: "today" },
  { id: "task-3", text: "Client meeting notes", done: true, category: "Sales", due: "Oct 26", flagged: true, bucket: "upcoming" },
  { id: "task-4", text: "Schedule team sync", done: true, category: "Product", due: "", flagged: false, bucket: "inbox" },
  { id: "task-5", text: "Prepare presentation slides", done: false, category: "Q4 Planning", due: "Today", flagged: true, bucket: "today" },
  { id: "task-6", text: "Finalize content calendar", done: false, category: "Marketing", due: "Oct 27", flagged: false, bucket: "upcoming" },
  { id: "task-7", text: "Update software dependencies", done: false, category: "Engineering", due: "", flagged: false, bucket: "inbox" },
  { id: "task-8", text: "Code review: PR #45", done: false, category: "Engineering", due: "", flagged: false, bucket: "inbox" },
  { id: "task-9", text: "Order office supplies", done: false, category: "General", due: "", flagged: false, bucket: "inbox" },
  { id: "task-10", text: "Draft customer onboarding email", done: false, category: "Marketing", due: "Tomorrow", flagged: false, bucket: "upcoming" },
  { id: "task-11", text: "Reconcile vendor invoices", done: false, category: "General", due: "Fri", flagged: true, bucket: "today" },
  { id: "task-12", text: "QA checkout flow on staging", done: false, category: "Engineering", due: "Today", flagged: true, bucket: "today" },
  { id: "task-13", text: "Write sprint retrospective notes", done: true, category: "Product", due: "Yesterday", flagged: false, bucket: "done" },
  { id: "task-14", text: "Share campaign performance report", done: false, category: "Marketing", due: "Mon", flagged: false, bucket: "upcoming" },
  { id: "task-15", text: "Confirm venue for client workshop", done: false, category: "Sales", due: "2 PM", flagged: true, bucket: "today" },
  { id: "task-16", text: "Backlog grooming for mobile issues", done: false, category: "Product", due: "Next week", flagged: false, bucket: "upcoming" },
  { id: "task-17", text: "Triage support inbox", done: false, category: "General", due: "", flagged: false, bucket: "inbox" },
  { id: "task-18", text: "Refine dashboard empty states", done: false, category: "Website Redesign", due: "Thu", flagged: false, bucket: "upcoming" },
  { id: "task-19", text: "Renew SSL certificate", done: false, category: "Engineering", due: "Urgent", flagged: true, bucket: "today" },
  { id: "task-20", text: "Approve social copy variations", done: true, category: "Marketing", due: "Today", flagged: false, bucket: "done" },
  { id: "task-21", text: "Prepare headcount forecast", done: false, category: "Q4 Planning", due: "Oct 30", flagged: false, bucket: "upcoming" },
  { id: "task-22", text: "Clean up duplicate CRM entries", done: false, category: "Sales", due: "", flagged: false, bucket: "inbox" },
  { id: "task-23", text: "Publish release notes draft", done: false, category: "Product", due: "Today", flagged: false, bucket: "today" },
  { id: "task-24", text: "Archive resolved design tickets", done: true, category: "Website Redesign", due: "Yesterday", flagged: false, bucket: "done" },
  { id: "task-25", text: "Add onboarding checklist to workspace", done: false, category: "Product", due: "Today", flagged: false, bucket: "today" },
];

export const CATEGORY_STYLES = {
  Marketing: "bg-[#e8f1ff] text-[#2563eb]",
  "Website Redesign": "bg-[#e6f9fc] text-[#0891b2]",
  Sales: "bg-[#eafaf1] text-[#16a34a]",
  Product: "bg-[#f2eaff] text-[#7c3aed]",
  "Q4 Planning": "bg-[#eaf1ff] text-[#4f46e5]",
  Engineering: "bg-[#edf2f7] text-[#475569]",
  General: "bg-[#eef2f6] text-[#64748b]",
};

export function getSidebarCount(items, id) {
  if (id === "all") return items.filter((item) => !item.done).length;
  if (id === "done") return items.filter((item) => item.done).length;
  return items.filter((item) => item.bucket === id && !item.done).length;
}

export function formatDateText() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());
}
