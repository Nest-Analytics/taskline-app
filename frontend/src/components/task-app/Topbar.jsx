import { useEffect, useRef, useState } from "react";
import { BellIcon, SearchIcon } from "./Icons.jsx";

function NotificationsMenu({ notifications }) {
  return (
    <div className="absolute right-0 top-10 z-20 w-64 rounded-[14px] border border-slate-200 bg-white p-2.5 shadow-[0_10px_30px_rgba(15,23,42,0.12)]">
      <p className="px-2 pb-2 text-[12px] font-semibold uppercase tracking-wide text-slate-400">
        Notifications
      </p>
      <div className="space-y-1">
        {notifications.length === 0 ? (
          <div className="rounded-[10px] bg-slate-50 px-3 py-3 text-[13px] text-slate-500">
            No notifications yet.
          </div>
        ) : null}
        {notifications.map((item) => (
          <div key={item.id} className="rounded-[10px] px-3 py-2 hover:bg-slate-50">
            <p className="text-[13px] font-medium text-slate-800">{item.label}</p>
            <p className="mt-0.5 text-[12px] text-slate-500">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileMenu({ ownerName, onOpenSettings, onLogout }) {
  return (
    <div className="absolute right-0 top-11 z-20 w-48 rounded-[14px] border border-slate-200 bg-white p-1.5 shadow-[0_10px_30px_rgba(15,23,42,0.12)]">
      <p className="px-3 py-2 text-[12px] text-slate-400 truncate">{ownerName}</p>
      <button
        type="button"
        onClick={onOpenSettings}
        className="flex w-full items-center rounded-[10px] px-3 py-2 text-[13px] text-slate-700 transition hover:bg-slate-50"
      >
        Settings
      </button>
      <div className="my-1 border-t border-slate-100" />
      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center rounded-[10px] px-3 py-2 text-[13px] text-red-600 transition hover:bg-red-50"
      >
        Sign out
      </button>
    </div>
  );
}

export default function Topbar({
  ownerName,
  notifications,
  unreadCount,
  notificationsOpen,
  onToggleNotifications,
  onCloseNotifications,
  onOpenSettings,
  onLogout,
  search,
  onSearchChange,
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (!notificationsOpen && !profileOpen) return undefined;
    function handlePointerDown(e) {
      if (!notificationsRef.current?.contains(e.target)) onCloseNotifications();
      if (!profileRef.current?.contains(e.target)) setProfileOpen(false);
    }
    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [notificationsOpen, profileOpen, onCloseNotifications]);

  return (
    <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-3">
      <label className="flex w-full max-w-[440px] items-center gap-2.5 rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-2 text-slate-400">
        <SearchIcon />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks..."
          className="w-full bg-transparent text-[14px] text-slate-700 outline-none placeholder:text-slate-400"
        />
      </label>
      <div className="flex items-center gap-2">
        <div ref={notificationsRef} className="relative">
          <button
            type="button"
            onClick={onToggleNotifications}
            className="relative rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
          >
            <BellIcon />
            {unreadCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                {Math.min(unreadCount, 9)}
              </span>
            ) : null}
          </button>
          {notificationsOpen
            ? <NotificationsMenu notifications={notifications} />
            : null
          }
        </div>
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7d949e] text-[13px] font-semibold text-white transition hover:bg-[#6b828c]"
          >
            {ownerName.slice(0, 1).toUpperCase()}
          </button>
          {profileOpen ? (
            <ProfileMenu
              ownerName={ownerName}
              onOpenSettings={() => { setProfileOpen(false); onOpenSettings(); }}
              onLogout={() => { setProfileOpen(false); onLogout(); }}
            />
          ) : null}
        </div>
      </div>
    </header>
  );
}
