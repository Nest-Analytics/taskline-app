import { useEffect, useState } from "react";
import Landing from "./components/task-app/Landing.jsx";
import Login from "./components/task-app/Login.jsx";
import TaskApp from "./TaskApp.jsx";
import { getAppConfig } from "./runtime-config.js";

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
  const [initialSignupRequired, setInitialSignupRequired] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [visible, setVisible] = useState(false);
  // "landing" | "signin" | "signup" — only relevant while signed-out and not on first-account flow
  const [screen, setScreen] = useState("landing");

  useEffect(() => {
    const apiBaseUrl = getAppConfig().apiBaseUrl || "";
    Promise.all([
      fetch(`${apiBaseUrl}/api/me`).then((r) => r.json()).catch(() => ({ ok: false })),
      fetch(`${apiBaseUrl}/api/signup/status`).then((r) => r.json()).catch(() => ({ needsInitialSignup: false })),
    ])
      .then(([me, signup]) => {
        if (me.ok) setUser(me.username);
        setInitialSignupRequired(Boolean(signup.needsInitialSignup) && !me.ok);
      })
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
    const apiBaseUrl = getAppConfig().apiBaseUrl || "";
    await fetch(`${apiBaseUrl}/logout`, { method: "POST" });
    switchScreen(() => {
      setUser(null);
      setScreen("landing");
    });
  }

  function handleLogin(username) {
    switchScreen(() => setUser(username));
  }

  function goToLanding() {
    switchScreen(() => setScreen("landing"));
  }

  function goToAuth(next) {
    switchScreen(() => setScreen(next));
  }

  if (!authChecked) return <Spinner />;

  let content;
  if (user) {
    content = <TaskApp onLogout={handleLogout} />;
  } else if (screen === "landing") {
    content = (
      <Landing
        onSignIn={() => goToAuth("signin")}
        onSignUp={() => goToAuth("signup")}
      />
    );
  } else {
    content = (
      <Login
        onLogin={handleLogin}
        initialSignupRequired={initialSignupRequired}
        initialMode={screen}
        onBackToLanding={goToLanding}
      />
    );
  }

  return (
    <div
      className="transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {content}
    </div>
  );
}
