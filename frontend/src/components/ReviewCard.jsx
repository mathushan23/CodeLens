import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

function ScoreCounter({ score }) {
  const scoreMotion = useMotionValue(0);
  const springScore = useSpring(scoreMotion, { stiffness: 120, damping: 20 });
  const rounded = useTransform(springScore, (value) => Math.round(value));

  useEffect(() => {
    scoreMotion.set(score);
  }, [score, scoreMotion]);

  return <motion.span>{rounded}</motion.span>;
}

export function ReviewCard({ review }) {
  return (
    <section className="glass-panel rounded-[32px] p-6">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Latest review</p>
          <h2 className="mt-2 font-display text-3xl text-white">{review.prTitle}</h2>
          <p className="mt-3 text-sm text-slate-400">
            {review.repoName} #{review.prNumber} • {review.branchFrom} to {review.branchTo}
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="rounded-[28px] border border-white/10 bg-slate-950/35 px-6 py-5 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Review score</p>
            <p className="mt-3 font-display text-6xl text-white">
              <ScoreCounter score={review.score} />
            </p>
          </div>
          <div className="grid min-w-[220px] grid-cols-2 gap-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Files</p>
              <p className="mt-2 text-2xl text-white">{review.filesReviewed}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Added</p>
              <p className="mt-2 text-2xl text-white">{review.linesAdded}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Removed</p>
              <p className="mt-2 text-2xl text-white">{review.linesRemoved}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Status</p>
              <p className="mt-2 text-2xl capitalize text-white">{review.status}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
