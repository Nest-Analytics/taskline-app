import { getAppConfig } from "../../runtime-config.js";

const FEATURES = [
  {
    title: "Plan in seconds",
    desc: "Capture tasks into Inbox, Today, or Upcoming and stay on top of the week.",
  },
  {
    title: "Keep focus",
    desc: "Flag what matters, filter noise, and work from a clean, quiet list.",
  },
  {
    title: "Track progress",
    desc: "Insights show what you've shipped so momentum stays visible.",
  },
];

export default function Landing({ onSignIn, onSignUp }) {
  const appTitle = getAppConfig().appTitle || "Taskline";

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-50 text-gray-900">
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[460px] w-[640px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-5 sm:px-8">
        <header className="flex items-center justify-between py-5">
          <span className="text-lg font-semibold tracking-tight">{appTitle}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSignIn}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={onSignUp}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
            >
              Get started
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-gray-500 backdrop-blur">
            A calmer way to get things done
          </span>

          <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Your day,{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              organized.
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">
            {appTitle} keeps your tasks, focus, and follow-through in one simple workspace — so
            you stop juggling tools and start making progress.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onSignUp}
              className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] sm:w-auto"
            >
              Create an account
              <span aria-hidden="true">→</span>
            </button>
            <button
              type="button"
              onClick={onSignIn}
              className="inline-flex h-11 w-full items-center justify-center rounded-full border border-gray-300 bg-white px-6 text-sm font-semibold text-gray-800 transition hover:bg-gray-100 sm:w-auto"
            >
              I already have an account
            </button>
          </div>

          <section className="mt-20 grid w-full gap-4 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-gray-200 bg-white/80 p-5 text-left shadow-sm backdrop-blur transition-colors hover:border-blue-200"
              >
                <h3 className="text-sm font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{f.desc}</p>
              </div>
            ))}
          </section>
        </main>

        <footer className="border-t border-gray-200/70 py-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} {appTitle}
        </footer>
      </div>
    </div>
  );
}
