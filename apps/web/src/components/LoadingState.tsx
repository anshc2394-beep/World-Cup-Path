export function LoadingState({ label = "Loading tournament data" }: { label?: string }) { return <div aria-live="polite" className="card animate-pulse p-8 text-center text-slate-400">{label}…</div>; }

