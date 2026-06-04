import { motion } from "framer-motion";

const metricMeta = [
  { key: "security", label: "Security", valueKey: "security", accent: "from-[#d85a30] to-[#ff9472]" },
  { key: "bug", label: "Bugs", valueKey: "bug", accent: "from-[#ba7517] to-[#f1c15f]" },
  { key: "complexity", label: "Complexity", valueKey: "complexity", accent: "from-[#534ab7] to-[#9e90ff]" },
  { key: "style", label: "Style", valueKey: "style", accent: "from-[#3b6d11] to-[#8bd24d]" },
];

export function MetricCards({ metrics }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metricMeta.map((metric, index) => (
        <motion.div
          key={metric.key}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-[28px] p-5"
          initial={{ opacity: 0, y: 24 }}
          transition={{ delay: index * 0.08, duration: 0.35, ease: "easeOut" }}
        >
          <div className={`mb-4 h-1.5 rounded-full bg-gradient-to-r ${metric.accent}`} />
          <p className="text-sm text-slate-400">{metric.label} issues</p>
          <p className="mt-2 font-display text-4xl text-white">{metrics[metric.valueKey]}</p>
        </motion.div>
      ))}
    </div>
  );
}
