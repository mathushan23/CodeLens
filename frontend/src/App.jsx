import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Home } from "./pages/Home";
import { Review } from "./pages/Review";
import { History } from "./pages/History";
import { useReview } from "./hooks/useReview";
import { useAuth } from "./hooks/useAuth";

const navItems = [
  { id: "home", label: "Overview" },
  { id: "review", label: "Live Review" },
  { id: "history", label: "History" },
];

export default function App() {
  const [activeView, setActiveView] = useState("home");
  const { user } = useAuth();
  const reviewState = useReview();

  const handleStartReview = (prUrl) => {
    setActiveView("review");
    reviewState.startReview(prUrl);
  };

  const renderView = () => {
    if (activeView === "history") {
      return <History history={reviewState.history} />;
    }

    if (activeView === "review") {
      return (
        <Review
          history={reviewState.history}
          onRetry={handleStartReview}
          reviewState={reviewState}
        />
      );
    }

    return <Home onStartReview={handleStartReview} reviewState={reviewState} />;
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(244,111,66,0.16),_transparent_28%),linear-gradient(135deg,_#07111f,_#081a1a_42%,_#111827)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="glass-panel sticky top-4 z-20 mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[28px] px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">CodeLens Studio</p>
            <h1 className="font-display text-2xl text-white sm:text-3xl">AI Code Review Dashboard</h1>
          </div>

          <nav className="flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  activeView === item.id
                    ? "bg-[#f46f42] text-white shadow-lg shadow-orange-950/30"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
                onClick={() => setActiveView(item.id)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/30 px-3 py-2">
            <img
              alt={user.name}
              className="h-10 w-10 rounded-full border border-white/10 object-cover"
              src={user.avatarUrl}
            />
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-slate-400">{user.handle}</p>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              initial={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
