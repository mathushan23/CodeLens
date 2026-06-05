import { motion } from "framer-motion";
import { ActionToast } from "../components/ActionToast";
import { Dashboard } from "../components/Dashboard";
import { PRInput } from "../components/PRInput";

function ReviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[28px] p-6">
        <div className="loading-shimmer h-8 w-2/3 rounded-full" />
        <div className="loading-shimmer mt-4 h-5 w-1/3 rounded-full" />
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="loading-shimmer h-28 rounded-[22px]" />
          ))}
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-panel rounded-[28px] p-6">
          <div className="loading-shimmer h-6 w-40 rounded-full" />
          <div className="loading-shimmer mt-4 h-4 w-full rounded-full" />
          <div className="loading-shimmer mt-3 h-4 w-5/6 rounded-full" />
          <div className="loading-shimmer mt-3 h-4 w-4/6 rounded-full" />
        </div>
        <div className="glass-panel rounded-[28px] p-6">
          <div className="loading-shimmer h-48 rounded-[22px]" />
        </div>
      </div>
    </div>
  );
}

export function Review({ history, historyLoading, onRetry, reviewState }) {
  const latestHistory = history[0];

  return (
    <>
      <ActionToast
        error={reviewState.actionError}
        message={reviewState.actionMessage}
        onDismiss={reviewState.dismissActionToast}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-6">
          <PRInput defaultValue={reviewState.prUrl} isProcessing={reviewState.isProcessing} onSubmit={onRetry} />

          {reviewState.reviewError ? (
            <section className="glass-panel rounded-[24px] border border-amber-300/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
              {reviewState.reviewError}
            </section>
          ) : null}

          {reviewState.isProcessing ? (
            <ReviewSkeleton />
          ) : (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <Dashboard
                isStreaming={reviewState.isStreaming}
                review={reviewState.review}
                summary={reviewState.streamedSummary}
              />
            </motion.div>
          )}
        </section>

        <aside className="space-y-6">
          <section className="glass-panel rounded-[28px] p-6">
            <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/70">Actions</p>
            <div className="mt-4 flex flex-col gap-3">
              <button
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!reviewState.review || reviewState.isExporting}
                onClick={reviewState.exportCurrentReview}
                type="button"
              >
                {reviewState.isExporting ? "Exporting PDF..." : "Export PDF"}
              </button>
              <button
                className="rounded-2xl bg-[#f46f42] px-4 py-3 text-sm text-white transition hover:bg-[#ff835a] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!reviewState.review || reviewState.isPosting}
                onClick={reviewState.postCurrentReview}
                type="button"
              >
                {reviewState.isPosting ? "Posting to PR..." : "Post to PR"}
              </button>
            </div>
          </section>

          <section className="glass-panel rounded-[28px] p-6">
            <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/70">Recent</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {historyLoading
                ? "Loading saved reviews..."
                : latestHistory
                  ? `${latestHistory.repoName} • ${latestHistory.prTitle}`
                  : "No saved reviews yet."}
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
