import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Home } from "./pages/Home";
import { Review } from "./pages/Review";
import { History } from "./pages/History";
import { useReview } from "./hooks/useReview";
import { useAuth } from "./hooks/useAuth";
import logo from "./assets/codelens-logo.png";

const navItems = [
  { id: "home", label: "Start" },
  { id: "review", label: "Review" },
  { id: "history", label: "History" },
];

export default function App() {
  const [activeView, setActiveView] = useState("home");
  const authState = useAuth();
  const reviewState = useReview({ isAuthenticated: authState.isAuthenticated });

  const handleStartReview = (nextPrUrl) => {
    setActiveView("review");
    reviewState.startReview(nextPrUrl);
  };

  const handleSelectReview = async (item) => {
    const loaded = await reviewState.loadReview(item.id);
    if (loaded) {
      setActiveView("review");
    }
  };

  const renderView = () => {
    if (activeView === "history") {
      return (
        <History
          history={reviewState.history}
          historyError={reviewState.historyError}
          isAuthenticated={authState.isAuthenticated}
          isLoading={reviewState.historyLoading}
          onSelectReview={handleSelectReview}
          selectedReviewId={reviewState.review?.id}
        />
      );
    }

    if (activeView === "review") {
      return (
        <Review
          history={reviewState.history}
          historyLoading={reviewState.historyLoading}
          onRetry={handleStartReview}
          reviewState={reviewState}
        />
      );
    }

    return <Home authState={authState} onStartReview={handleStartReview} reviewState={reviewState} />;
  };

  return (
    <div className="app-shell min-h-screen text-slate-100">
      <div className="animated-backdrop" aria-hidden="true">
        <div className="animated-backdrop__orb animated-backdrop__orb--orange" />
        <div className="animated-backdrop__orb animated-backdrop__orb--blue" />
        <div className="animated-backdrop__orb animated-backdrop__orb--violet" />
        <div className="animated-backdrop__grid" />
      </div>
      <div className="flex min-h-screen flex-col">
        <header className="relative z-10 border-b border-white/8 bg-slate-950/45 backdrop-blur-xl">
          <div className="flex w-full flex-col gap-4 px-4 py-4 sm:px-6 lg:px-10 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <img
                alt="CodeLens logo"
                className="h-14 w-14 rounded-2xl border border-white/10 object-cover shadow-[0_18px_50px_rgba(16,22,46,0.45)]"
                src={logo}
              />
              <div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-cyan-200/70">CodeLens</p>
                <h1 className="font-display text-xl sm:text-2xl">
                  <span className="gradient-text">AI Review</span>{" "}
                  <span className="text-slate-100">Command Center</span>
                </h1>
              </div>
            </div>

            <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
              <nav className="flex w-full flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1 xl:w-auto">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    className={`rounded-xl px-4 py-2.5 text-sm transition ${
                      activeView === item.id
                        ? "nav-pill-active bg-white text-slate-950"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                    onClick={() => setActiveView(item.id)}
                    data-nav={item.id}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="flex items-center gap-3">
                  <img
                    alt={authState.user.name}
                    className="h-10 w-10 rounded-xl border border-white/10 object-cover"
                    src={authState.user.avatarUrl}
                  />
                  <div>
                    <p className="text-sm font-medium text-white">{authState.user.name}</p>
                    <p className="text-xs text-slate-400">
                      {authState.isLoading ? "Checking session..." : authState.user.handle}
                    </p>
                  </div>
                </div>
                {authState.isLoading ? null : authState.isAuthenticated ? (
                  <a
                    className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
                    href={authState.logoutUrl}
                  >
                    Logout
                  </a>
                ) : (
                  <a
                    className="rounded-xl bg-[#f46f42] px-3 py-2 text-xs text-white transition hover:bg-[#ff835a]"
                    href={authState.loginUrl}
                  >
                    Sign in
                  </a>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 flex-1 px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              initial={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
