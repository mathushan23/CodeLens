import { useState } from "react";

const severityOptions = ["all", "critical", "high", "medium", "low"];

const severityStyles = {
  critical: "text-[#ffb299]",
  high: "text-[#ffd997]",
  medium: "text-[#c5bdff]",
  low: "text-[#b6ef89]",
};

export function HistoryTable({ history, onSelectReview, selectedReviewId }) {
  const [severityFilter, setSeverityFilter] = useState("all");
  const [repoFilter, setRepoFilter] = useState("");

  const filteredRows = history.filter((item) => {
    const matchesSeverity = severityFilter === "all" || item.severity === severityFilter;
    const matchesRepo = repoFilter
      ? item.repoName.toLowerCase().includes(repoFilter.toLowerCase())
      : true;

    return matchesSeverity && matchesRepo;
  });

  return (
    <section className="glass-panel rounded-[32px] p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">History</p>
          <h3 className="mt-2 font-display text-2xl text-white">Past reviews</h3>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            className="min-h-11 rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/60"
            onChange={(event) => setRepoFilter(event.target.value)}
            placeholder="Filter by repository"
            value={repoFilter}
          />
          <select
            className="min-h-11 rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white outline-none focus:border-cyan-300/60"
            onChange={(event) => setSeverityFilter(event.target.value)}
            value={severityFilter}
          >
            {severityOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All severities" : option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-white/10">
        <div className="hidden grid-cols-[1.4fr_2fr_0.7fr_0.7fr_0.7fr] gap-4 border-b border-white/10 bg-white/5 px-5 py-4 text-xs uppercase tracking-[0.25em] text-slate-500 md:grid">
          <span>Repository</span>
          <span>Pull Request</span>
          <span>Issues</span>
          <span>Severity</span>
          <span>Score</span>
        </div>

        <div className="divide-y divide-white/10">
          {filteredRows.length === 0 ? (
            <div className="px-5 py-8 text-sm text-slate-400">No reviews match the current filters yet.</div>
          ) : null}
          {filteredRows.map((item) => (
            <button
              key={item.id}
              className={`grid w-full gap-4 px-5 py-4 text-left transition md:grid-cols-[1.4fr_2fr_0.7fr_0.7fr_0.7fr] md:items-center ${
                selectedReviewId === item.id ? "bg-white/10" : "hover:bg-white/5"
              }`}
              onClick={() => onSelectReview?.(item)}
              type="button"
            >
              <div>
                <p className="mb-1 text-[11px] uppercase tracking-[0.22em] text-slate-500 md:hidden">Repository</p>
                <p className="text-sm text-white">{item.repoName}</p>
                <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="mb-1 text-[11px] uppercase tracking-[0.22em] text-slate-500 md:hidden">Pull Request</p>
                <p className="text-sm text-slate-200">{item.prTitle}</p>
              </div>
              <div>
                <p className="mb-1 text-[11px] uppercase tracking-[0.22em] text-slate-500 md:hidden">Issues</p>
                <p className="text-sm text-slate-300">{item.issues}</p>
              </div>
              <div>
                <p className="mb-1 text-[11px] uppercase tracking-[0.22em] text-slate-500 md:hidden">Severity</p>
                <p className={`text-sm capitalize ${severityStyles[item.severity]}`}>{item.severity}</p>
              </div>
              <div>
                <p className="mb-1 text-[11px] uppercase tracking-[0.22em] text-slate-500 md:hidden">Score</p>
                <p className="font-medium text-white">{item.score}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
