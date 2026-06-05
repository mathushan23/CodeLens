import { MetricCards } from "./MetricCards";
import { ReviewCard } from "./ReviewCard";
import { AISummary } from "./AISummary";
import { CategoryChart } from "./CategoryChart";
import { IssueList } from "./IssueList";

export function Dashboard({ review, summary, isStreaming }) {
  if (!review) {
    return (
      <section className="glass-panel rounded-[32px] p-8 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">No Active Review</p>
        <h2 className="mt-3 font-display text-3xl text-white">Analyze a pull request or open one from history.</h2>
        <p className="mt-4 text-slate-400">
          This screen will fill with real metrics, findings, and an AI summary after the backend completes a review.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <ReviewCard review={review} />
      <MetricCards metrics={review.metrics} />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <AISummary isStreaming={isStreaming} summary={summary} />
        <CategoryChart issues={review.issues} />
      </div>
      <IssueList issues={review.issues} />
    </div>
  );
}
