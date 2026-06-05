import { HistoryTable } from "../components/HistoryTable";

export function History({ history, historyError, isAuthenticated, isLoading, onSelectReview, selectedReviewId }) {
  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[28px] p-6">
        <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/70">History</p>
        <h2 className="mt-3 font-display text-3xl text-white">Saved reviews</h2>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300">
          Reopen any saved review from the backend and continue from the same workspace.
        </p>
        <p className="mt-3 text-sm text-slate-400">
          {isLoading
            ? "Loading review history..."
            : isAuthenticated
              ? "Click a row to open it in the review workspace."
              : "Sign in with GitHub to load saved history from the backend."}
        </p>
        {historyError ? <p className="mt-2 text-sm text-amber-200">{historyError}</p> : null}
      </section>

      <HistoryTable history={history} onSelectReview={onSelectReview} selectedReviewId={selectedReviewId} />
    </div>
  );
}
