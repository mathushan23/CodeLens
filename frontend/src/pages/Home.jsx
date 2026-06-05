import { PRInput } from "../components/PRInput";

export function Home({ authState, onStartReview, reviewState }) {
  return (
    <div className="grid min-h-[calc(100vh-140px)] gap-6 xl:grid-cols-[minmax(0,1.15fr)_380px]">
      <section className="space-y-6">
        <div className="glass-panel hero-panel relative overflow-hidden rounded-[28px] p-6 sm:p-7">
          <div className="absolute inset-y-0 right-0 hidden w-44 bg-[radial-gradient(circle_at_center,_rgba(131,97,255,0.18),_transparent_68%)] lg:block" />
          <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/70">Start a review</p>
          <h2 className="mt-3 max-w-3xl font-display text-3xl leading-tight sm:text-4xl xl:text-[3.3rem]">
            <span className="gradient-text">Inspect code.</span>{" "}
            <span className="gradient-text gradient-text--cool">Catch issues.</span>{" "}
            <span className="text-emerald-200">Ship with confidence.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-300">
            Analyze the diff, inspect findings, reopen saved reports, export a PDF, and post the result back to GitHub from one place.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-cyan-100">
              Security signals
            </span>
            <span className="rounded-full border border-orange-300/25 bg-orange-300/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-orange-100">
              Review history
            </span>
            <span className="rounded-full border border-violet-300/25 bg-violet-300/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-violet-100">
              Export and publish
            </span>
          </div>
        </div>

        <PRInput defaultValue={reviewState.prUrl} isProcessing={reviewState.isProcessing} onSubmit={onStartReview} />

        {reviewState.reviewError ? (
          <section className="glass-panel rounded-[24px] border border-amber-300/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
            {reviewState.reviewError}
          </section>
        ) : null}
      </section>

      <aside className="space-y-6">
        <section className="glass-panel rounded-[28px] p-6">
          <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/70">Session</p>
          <h3 className="mt-3 font-display text-2xl">
            <span className={authState.isAuthenticated ? "text-emerald-200" : "text-amber-200"}>
              {authState.isAuthenticated ? "Connected to GitHub" : "Authentication required"}
            </span>
          </h3>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {authState.isAuthenticated
              ? "Your account can save reviews, reopen history, export PDFs, and post review comments to pull requests."
              : "Sign in to store reviews in MySQL and enable export and post-to-PR actions."}
          </p>
        </section>

        <section className="glass-panel rounded-[28px] p-6">
          <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/70">Ready state</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-cyan-300/12 bg-cyan-300/[0.04] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">History</p>
              <p className="mt-2 text-sm text-slate-300">
                {authState.isAuthenticated ? "Connected to saved backend reviews." : "Available after GitHub sign-in."}
              </p>
            </div>
            <div className="rounded-2xl border border-orange-300/12 bg-orange-300/[0.04] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Export</p>
              <p className="mt-2 text-sm text-slate-300">Generate a PDF once a review has been analyzed or reopened.</p>
            </div>
            <div className="rounded-2xl border border-violet-300/12 bg-violet-300/[0.04] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">GitHub</p>
              <p className="mt-2 text-sm text-slate-300">Post the active review back to the pull request when you're ready.</p>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}
