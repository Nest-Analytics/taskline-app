import { CalendarIcon, GridIcon, InboxIcon } from "./Icons.jsx";

function sidebarIconFor(id) {
  if (id === "all") return <GridIcon />;
  if (id === "inbox") return <InboxIcon />;
  return <CalendarIcon />;
}

export default function Sidebar({
  appName,
  ownerName,
  items,
  navItems,
  section,
  onSectionChange,
  getCount,
  onOpenSettings,
}) {
  return (
    <aside className="flex h-screen flex-col overflow-y-auto bg-[linear-gradient(160deg,#0f1722_0%,#111b27_100%)] px-4 py-5 text-white">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-[linear-gradient(180deg,#4fa3ff_0%,#2b78ee_100%)] text-sm font-bold shadow-[0_8px_16px_rgba(43,120,238,0.30)]">
          ⚡
        </div>
        <h1 className="text-[1.1rem] font-semibold tracking-[-0.02em]">{appName}</h1>
      </div>

      <nav className="mt-7 space-y-0.5">
        {navItems.map((item) => {
          const active = item.id === section;
          const count = getCount(items, item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSectionChange(item.id)}
              className={`relative flex w-full items-center justify-between rounded-[12px] px-3 py-2.5 text-left transition ${
                active
                  ? "bg-white/12 text-white"
                  : "text-slate-400 hover:bg-white/6 hover:text-slate-200"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-blue-400" />
              )}
              <span className="flex items-center gap-3">
                <span className={active ? "text-blue-300" : "text-slate-500"}>
                  {sidebarIconFor(item.id)}
                </span>
                <span className="text-[14px] font-medium">{item.label}</span>
              </span>
              {count > 0 ? (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-slate-300">
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="mt-6 border-t border-white/8 pt-4">
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-slate-400 transition hover:bg-white/6 hover:text-slate-200"
        >
          <span className="text-slate-500">
            <CalendarIcon />
          </span>
          <span className="text-[14px] font-medium">Settings</span>
        </button>
      </div>

      <div className="mt-auto border-t border-white/8 pt-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#738692] text-[12px] font-semibold">
            {ownerName.slice(0, 1).toUpperCase()}
          </div>
          <p className="text-[14px] font-medium text-slate-200 truncate">{ownerName}</p>
        </div>
      </div>
    </aside>
  );
}
