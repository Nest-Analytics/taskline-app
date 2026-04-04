import { useEffect, useState } from "react";
import Login from "./components/task-app/Login.jsx";
import TaskApp from "./TaskApp.jsx";

function Spinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"
      />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => { if (d.ok) setUser(d.username); })
      .finally(() => {
        setAuthChecked(true);
        requestAnimationFrame(() => setVisible(true));
      });
  }, []);

  async function switchScreen(fn) {
    setVisible(false);
    await new Promise((r) => setTimeout(r, 280));
    fn();
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }

  async function handleLogout() {
    await fetch("/logout", { method: "POST" });
    switchScreen(() => setUser(null));
  }

  function handleLogin(username) {
    switchScreen(() => setUser(username));
  }

  if (!authChecked) return <Spinner />;

  return (
    <div
      className="transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {user
        ? <TaskApp onLogout={handleLogout} />
        : <Login onLogin={handleLogin} />
      }
    </div>
  );
}
