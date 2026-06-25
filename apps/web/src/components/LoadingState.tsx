import { LoaderCircle } from "lucide-react";

export function LoadingState({
  label = "Loading tournament data",
  body = "Connecting to the local API and preparing the dashboard.",
}: {
  label?: string;
  body?: string;
}) {
  return (
    <div aria-live="polite" className="card overflow-hidden p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
        <LoaderCircle aria-hidden="true" className="animate-spin" size={22} />
      </div>
      <h2 className="font-display mt-4 text-2xl font-bold">{label}…</h2>
      <p className="muted mx-auto mt-2 max-w-md leading-7">{body}</p>
      <div className="mx-auto mt-6 grid max-w-lg gap-3 sm:grid-cols-3" aria-hidden="true">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-16 animate-pulse rounded-2xl border border-slate-700/70 bg-slate-950/50" />
        ))}
      </div>
    </div>
  );
}
