import { motion } from "framer-motion";
import { PRInput } from "../components/PRInput";

const featureCards = [
  { title: "Security-first review", copy: "Surface trust-boundary mistakes, auth gaps, and unsafe defaults before they ship." },
  { title: "Architectural feedback", copy: "Flag async hazards, risky retries, and complexity hotspots with actionable guidance." },
  { title: "Executive visibility", copy: "Translate diffs into score, trend, and severity signals that teams can act on fast." },
];

export function Home({ onStartReview, reviewState }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <PRInput
          defaultValue={reviewState.prUrl}
          isProcessing={reviewState.isProcessing}
          onSubmit={onStartReview}
        />

        <div className="glass-panel relative overflow-hidden rounded-[32px] p-6">
          <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,_rgba(77,208,225,0.25),_transparent_58%)]" />
          <p className="relative text-xs uppercase tracking-[0.35em] text-cyan-200/70">What You Get</p>
          <h2 className="relative mt-2 font-display text-3xl text-white">A dashboard built for shipping teams.</h2>
          <p className="relative mt-4 leading-8 text-slate-300">
            Start with a PR URL and move from diff to narrative, issue list, and historic review context without leaving the page.
          </p>

          <div className="relative mt-6 space-y-4">
            {featureCards.map((card, index) => (
              <motion.div
                key={card.title}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-[28px] border border-white/10 bg-slate-950/35 p-5"
                initial={{ opacity: 0, x: 18 }}
                transition={{ delay: index * 0.08, duration: 0.35, ease: "easeOut" }}
              >
                <h3 className="text-lg text-white">{card.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-400">{card.copy}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Average score", value: "86", helper: "Across the last 30 team reviews" },
          { label: "Critical issues caught", value: "14", helper: "Before merge in the past week" },
          { label: "Median turnaround", value: "2m 18s", helper: "From PR paste to actionable summary" },
        ].map((item) => (
          <div key={item.label} className="glass-panel rounded-[28px] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{item.label}</p>
            <p className="mt-3 font-display text-4xl text-white">{item.value}</p>
            <p className="mt-2 text-sm text-slate-400">{item.helper}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
