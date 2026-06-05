import { AnimatePresence, motion } from "framer-motion";

export function ActionToast({ error, message, onDismiss }) {
  const content = error || message;
  const isError = Boolean(error);

  return (
    <AnimatePresence>
      {content ? (
        <motion.div
          animate={{ opacity: 1, x: 0, y: 0 }}
          className={`fixed right-4 top-4 z-50 w-[min(92vw,420px)] rounded-[24px] border px-5 py-4 shadow-[0_22px_60px_rgba(4,10,24,0.45)] backdrop-blur-xl sm:right-6 sm:top-6 ${
            isError
              ? "border-amber-300/30 bg-amber-500/15 text-amber-50"
              : "border-emerald-300/30 bg-emerald-500/15 text-emerald-50"
          }`}
          exit={{ opacity: 0, x: 24, y: -8 }}
          initial={{ opacity: 0, x: 24, y: -8 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold ${
                isError ? "bg-amber-300/15 text-amber-100" : "bg-emerald-300/15 text-emerald-100"
              }`}
            >
              {isError ? "!" : "OK"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">{isError ? "Action failed" : "Success"}</p>
              <p className="mt-1 text-sm leading-6 text-current">{content}</p>
            </div>
            <button
              className="rounded-xl px-2 py-1 text-xs text-white/65 transition hover:bg-white/10 hover:text-white"
              onClick={onDismiss}
              type="button"
            >
              Close
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
