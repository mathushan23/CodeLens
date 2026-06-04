import { useState } from "react";
import { motion } from "framer-motion";

export function PRInput({ defaultValue = "", isProcessing, onSubmit }) {
  const [prUrl, setPrUrl] = useState(defaultValue);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(prUrl);
  };

  return (
    <motion.form
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-[32px] p-6 sm:p-7"
      initial={{ opacity: 0, y: 16 }}
      onSubmit={handleSubmit}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-cyan-200/70">PR Analysis</p>
          <h2 className="font-display text-2xl text-white sm:text-3xl">
            Paste a GitHub pull request and generate a review in seconds.
          </h2>
        </div>
        <span className="hidden rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1 text-xs text-orange-100 sm:inline-flex">
          Claude Sonnet + GitHub diff intelligence
        </span>
      </div>

      <label className="mb-3 block text-sm text-slate-300" htmlFor="pr-url">
        GitHub PR URL
      </label>
      <div className="flex flex-col gap-3 lg:flex-row">
        <input
          className="min-h-14 flex-1 rounded-2xl border border-white/10 bg-slate-950/60 px-5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60"
          id="pr-url"
          onChange={(event) => setPrUrl(event.target.value)}
          placeholder="https://github.com/org/repo/pull/418"
          value={prUrl}
        />
        <button
          className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-[#f46f42] px-6 text-sm font-medium text-white transition hover:bg-[#ff835a] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isProcessing}
          type="submit"
        >
          {isProcessing ? "Reviewing..." : "Analyze Pull Request"}
        </button>
      </div>
      <p className="mt-3 text-sm text-slate-400">
        We highlight security, bugs, complexity, and style issues with an action-focused summary.
      </p>
    </motion.form>
  );
}
