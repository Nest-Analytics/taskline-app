import { useEffect, useRef, useState } from "react";
import { createInputController } from "./input.js";
import { createRenderer } from "./renderer.js";
import { createGame } from "./game.js";
import { GAME_CONFIG } from "./config.js";
import { THEMES } from "./themes.js";
import { getAppConfig } from "./runtime-config.js";
import { loadRuns, saveRun, topRuns } from "./runs.js";

const APP = getAppConfig();

export default function App() {
  const cRef = useRef(null), gRef = useRef(null);
  const [theme, setTheme] = useState(APP.themeDefault), [paused, setPaused] = useState(false);
  const [showIntro, setShowIntro] = useState(() => localStorage.getItem("sd_intro_seen") !== "1");
  const [runs, setRuns] = useState(() => loadRuns());
  const [hud, setHud] = useState({ score: 0, level: 1, lives: 3, time: GAME_CONFIG.totalTimeSeconds, powerUp: "None", combo: 0, mode: "Normal", special: 0 });
  const top = topRuns(runs);
  const best = top[0]?.score || 0;

  useEffect(() => {
    const c = cRef.current; if (!c) return undefined;
    const game = createGame({
      input: createInputController(c), renderer: createRenderer(c), onHUDUpdate: setHud,
      onSessionEnd: (session) => setRuns(saveRun(session)),
    });
    gRef.current = game; game.start(); return () => { game.stop(); gRef.current = null; };
  }, []);
  useEffect(() => { document.body.dataset.theme = theme; }, [theme]);
  useEffect(() => { document.title = APP.appTitle; }, []);

  return (
    <main className="app">
      {showIntro && <section className="panel"><h3>Quick Start</h3><p>Catch stars, avoid bombs, and push your best score.</p><button className="theme-btn active" onClick={() => { localStorage.setItem("sd_intro_seen", "1"); setShowIntro(false); }}>Got it</button></section>}
      <header className="top"><div><p className="eyebrow">{APP.brandTagline}</p><h1>{APP.appTitle}</h1></div><div className="badges switcher">{APP.enableThemeSwitcher && THEMES.map((t) => <button key={t.id} type="button" className={`theme-btn${theme === t.id ? " active" : ""}`} onClick={() => setTheme(t.id)}>{t.label}</button>)}{APP.showEnvBadge && <span>{APP.appEnv}</span>}</div></header>
      <section className="stats"><article><p>Score</p><strong>{hud.score}</strong></article><article><p>Best</p><strong>{best}</strong></article><article><p>Combo</p><strong>x{1 + Math.floor(hud.combo / 3)}</strong></article><article><p>Mode</p><strong>{hud.mode}</strong></article><article><p>Special</p><strong>{hud.special > 0 ? `${hud.special}s` : "Ready"}</strong></article><article><p>Level</p><strong>{hud.level}</strong></article><article><p>Lives</p><strong>{hud.lives}</strong></article><article><p>Time</p><strong>{hud.time}s</strong></article><article><p>Power-Up</p><strong>{hud.powerUp}</strong></article></section>
      <section className="arena"><p className="controls">Move: Mouse / touch / Arrow keys / A D</p><canvas ref={cRef} id="game-canvas" width={GAME_CONFIG.width} height={GAME_CONFIG.height} aria-label="Game area" /></section>
      <footer className="actions"><button className="restart-btn" onClick={() => { gRef.current?.restart(); setPaused(false); }}>Restart</button><button className="restart-btn" onClick={() => { const ok = paused ? gRef.current?.resume() : gRef.current?.pause(); if (ok) setPaused((v) => !v); }}>{paused ? "Resume" : "Pause"}</button><button className="restart-btn" onClick={() => { if (gRef.current?.abort()) setPaused(false); }}>Abort</button><button className="restart-btn" disabled={hud.special > 0 || paused} onClick={() => gRef.current?.triggerSpecial()}>Special Pulse</button><p>Boss waves every 4 levels. Use Special Pulse wisely.</p></footer>
      <section className="panel"><h3>Top Runs</h3><div className="grid2"><article>{top.map((r, i) => <p key={`t-${r.at}-${i}`}>#{i + 1} Score {r.score} | L{r.level}</p>)}{top.length === 0 && <p>No runs yet.</p>}</article><article><h4>Recent Runs</h4>{runs.slice(0, 6).map((r, i) => <p key={`r-${r.at}-${i}`}>{new Date(r.at).toLocaleDateString()} - Score {r.score} | {r.won ? "Win" : "Loss"}</p>)}</article></div></section>
    </main>
  );
}
