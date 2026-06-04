import { motion } from "framer-motion";

const severityMeta = {
  critical: { label: "Critical", className: "bg-[#d85a30]/20 text-[#ffb299] border-[#d85a30]/40" },
  high: { label: "High", className: "bg-[#ba7517]/20 text-[#ffd997] border-[#ba7517]/40" },
  medium: { label: "Medium", className: "bg-[#534ab7]/20 text-[#c5bdff] border-[#534ab7]/40" },
  low: { label: "Low", className: "bg-[#3b6d11]/20 text-[#b6ef89] border-[#3b6d11]/40" },
};

export function IssueList({ issues }) {
  return (
    <section className="glass-panel rounded-[32px] p-6">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Findings</p>
        <h3 className="mt-2 font-display text-2xl text-white">Suggested fixes</h3>
      </div>

      <div className="space-y-4">
        {issues.map((issue, index) => (
          <motion.article
            key={issue.id}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[28px] border border-white/10 bg-slate-950/35 p-5"
            initial={{ opacity: 0, y: 18 }}
            transition={{ delay: index * 0.05, duration: 0.28, ease: "easeOut" }}
          >
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium ${severityMeta[issue.severity].className}`}
              >
                {severityMeta[issue.severity].label}
              </span>
              <span className="text-xs uppercase tracking-[0.25em] text-slate-500">{issue.type}</span>
              <span className="text-xs text-slate-400">
                {issue.filePath}:{issue.lineNumber}
              </span>
            </div>
            <h4 className="text-lg font-medium text-white">{issue.title}</h4>
            <p className="mt-3 text-sm leading-7 text-slate-300">{issue.description}</p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-slate-500">Recommended change</p>
              <p className="text-sm leading-7 text-slate-200">{issue.suggestion}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
