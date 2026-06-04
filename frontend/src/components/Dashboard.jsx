import { MetricCards } from "./MetricCards";
import { ReviewCard } from "./ReviewCard";
import { AISummary } from "./AISummary";
import { CategoryChart } from "./CategoryChart";
import { IssueList } from "./IssueList";

export function Dashboard({ review, summary, isStreaming }) {
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
