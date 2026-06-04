import { motion } from "framer-motion";

const severityOrder = ["critical", "high", "medium", "low"];

const severityMeta = {
  critical: { label: "Critical", color: "#D85A30" },
  high: { label: "High", color: "#BA7517" },
  medium: { label: "Medium", color: "#534AB7" },
  low: { label: "Low", color: "#3B6D11" },
};

export function CategoryChart({ issues }) {
  const total = issues.length || 1;

  const severityCounts = severityOrder.map((severity) => {
    const count = issues.filter((issue) => issue.severity === severity).length;
    return {
      severity,
      count,
      percentage: Math.round((count / total) * 100),
    };
  });

  return (
    <section className="glass-panel rounded-[32px] p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Severity Mix</p>
          <h3 className="mt-2 font-display text-2xl text-white">Issue distribution</h3>
        </div>
        <p className="text-sm text-slate-400">{issues.length} findings</p>
      </div>

      <div className="space-y-4">
        {severityCounts.map((item, index) => (
          <div key={item.severity}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-white">{severityMeta[item.severity].label}</span>
              <span className="text-slate-400">{item.count} issues</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/5">
              <motion.div
                animate={{ width: `${item.percentage}%` }}
                className="h-full rounded-full"
                initial={{ width: 0 }}
                style={{ backgroundColor: severityMeta[item.severity].color }}
                transition={{ delay: index * 0.08, duration: 0.45, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
