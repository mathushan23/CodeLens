import { motion } from "framer-motion";

export function AISummary({ summary, isStreaming }) {
  return (
    <section className="glass-panel rounded-[32px] p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">AI Summary</p>
          <h3 className="mt-2 font-display text-2xl text-white">Merge-readiness narrative</h3>
        </div>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
          {isStreaming ? "Streaming" : "Complete"}
        </span>
      </div>

      <motion.p
        animate={{ opacity: 1 }}
        className="leading-8 text-slate-200"
        initial={{ opacity: 0.4 }}
        transition={{ duration: 0.25 }}
      >
        {summary}
        {isStreaming ? <span className="ml-1 inline-block h-5 w-2 animate-pulse rounded-full bg-cyan-300" /> : null}
      </motion.p>
    </section>
  );
}
