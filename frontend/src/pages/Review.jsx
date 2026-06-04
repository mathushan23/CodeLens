import { motion } from "framer-motion";
import { Dashboard } from "../components/Dashboard";
import { PRInput } from "../components/PRInput";

function ReviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[32px] p-6">
        <div className="loading-shimmer h-8 w-2/3 rounded-full" />
        <div className="loading-shimmer mt-4 h-5 w-1/3 rounded-full" />
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="loading-shimmer h-28 rounded-[28px]" />
          ))}
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-panel rounded-[32px] p-6">
          <div className="loading-shimmer h-6 w-40 rounded-full" />
          <div className="loading-shimmer mt-4 h-4 w-full rounded-full" />
          <div className="loading-shimmer mt-3 h-4 w-5/6 rounded-full" />
          <div className="loading-shimmer mt-3 h-4 w-4/6 rounded-full" />
        </div>
        <div className="glass-panel rounded-[32px] p-6">
          <div className="loading-shimmer h-48 rounded-[28px]" />
        </div>
      </div>
    </div>
  );
}

export function Review({ history, onRetry, reviewState }) {
  const latestHistory = history[0];

  return (
    <div className="space-y-6">
      <PRInput
        defaultValue={reviewState.prUrl}
        isProcessing={reviewState.isProcessing}
        onSubmit={onRetry}
      />

      <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="glass-panel rounded-[28px] px-5 py-4">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Latest completed review</p>
          <p className="mt-2 text-sm text-slate-200">
            {latestHistory.repoName} • {latestHistory.prTitle}
          </p>
        </div>
        <div className="glass-panel rounded-[28px] px-5 py-4 text-sm text-slate-300">
          Current state: <span className="text-white">{reviewState.isProcessing ? "Processing diff" : "Ready"}</span>
        </div>
      </section>

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
    </div>
  );
}
