type StatusTone = "qualified" | "race" | "eliminated" | "pending";

const toneStyles: Record<StatusTone, string> = {
  qualified: "border-emerald-300/30 bg-emerald-400/10 text-emerald-200",
  race: "border-amber-300/35 bg-amber-400/10 text-amber-100",
  eliminated: "border-rose-300/30 bg-rose-400/10 text-rose-200",
  pending: "border-slate-500/35 bg-slate-800/70 text-slate-300",
};

const dotStyles: Record<StatusTone, string> = {
  qualified: "bg-emerald-300",
  race: "bg-amber-300",
  eliminated: "bg-rose-300",
  pending: "bg-slate-400",
};

export function StatusBadge({ label, tone }: { label: string; tone: StatusTone }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${toneStyles[tone]}`}>
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${dotStyles[tone]}`} />
      {label}
    </span>
  );
}
