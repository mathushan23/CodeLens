import { HistoryTable } from "../components/HistoryTable";

export function History({ history }) {
  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[32px] p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Review archive</p>
        <h2 className="mt-2 font-display text-3xl text-white">Team memory for every pull request.</h2>
        <p className="mt-4 max-w-3xl leading-8 text-slate-300">
          Keep severity trends, score drift, and repository hotspots visible so engineering leads can reopen past
          reviews with context instead of guessing what changed.
        </p>
      </section>
      <HistoryTable history={history} />
    </div>
  );
}
