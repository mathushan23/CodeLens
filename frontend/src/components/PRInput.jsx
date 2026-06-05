import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const prUrlPattern = /^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+\/?$/i;

export function PRInput({ defaultValue = "", isProcessing, onSubmit }) {
  const [prUrl, setPrUrl] = useState(defaultValue);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setPrUrl(defaultValue);
  }, [defaultValue]);

  const trimmedPrUrl = prUrl.trim();
  const showValidation = touched && trimmedPrUrl.length > 0 && !prUrlPattern.test(trimmedPrUrl);

  const handleSubmit = (event) => {
    event.preventDefault();
    setTouched(true);

    if (!trimmedPrUrl || !prUrlPattern.test(trimmedPrUrl)) {
      return;
    }

    onSubmit(trimmedPrUrl);
  };

  return (
    <motion.form
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel relative overflow-hidden rounded-[32px] p-6 sm:p-7"
      initial={{ opacity: 0, y: 16 }}
      onSubmit={handleSubmit}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="pointer-events-none absolute -right-12 top-0 h-36 w-36 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-28 w-28 rounded-full bg-violet-400/10 blur-3xl" />
      <div className="mb-6">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-cyan-200/70">PR Analysis</p>
          <h2 className="font-display text-2xl leading-tight sm:text-3xl">
            <span className="text-slate-100">Paste a GitHub pull request and </span>
            <span className="gradient-text gradient-text--pulse">generate a review in seconds.</span>
          </h2>
        </div>
      </div>

      <label className="mb-3 block text-sm text-slate-300" htmlFor="pr-url">
        GitHub PR URL
      </label>
      <div className="flex flex-col gap-3 lg:flex-row">
        <input
          className={`min-h-14 flex-1 rounded-2xl border bg-slate-950/60 px-5 text-sm text-white outline-none transition placeholder:text-slate-500 ${
            showValidation ? "border-amber-300/60" : "border-white/10 focus:border-cyan-300/60"
          }`}
          id="pr-url"
          onBlur={() => setTouched(true)}
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
      <p className={`mt-3 text-sm ${showValidation ? "text-amber-200" : "text-slate-400"}`}>
        {showValidation
          ? "Use a full GitHub pull request URL like https://github.com/owner/repo/pull/123"
          : "We highlight security, bugs, complexity, and style issues with an action-focused summary."}
      </p>
    </motion.form>
  );
}
