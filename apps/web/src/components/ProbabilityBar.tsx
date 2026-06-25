export type ProbabilityTone = "cyan" | "amber" | "emerald" | "blue" | "slate";

const barStyles: Record<ProbabilityTone, string> = {
  cyan: "from-blue-500 to-cyan-300",
  amber: "from-amber-500 to-yellow-300",
  emerald: "from-emerald-500 to-lime-300",
  blue: "from-blue-600 to-sky-300",
  slate: "from-slate-500 to-slate-300",
};

const valueStyles: Record<ProbabilityTone, string> = {
  cyan: "text-cyan-200",
  amber: "text-amber-200",
  emerald: "text-emerald-200",
  blue: "text-sky-200",
  slate: "text-slate-200",
};

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

function toPercent(value: number) {
  return Math.round(Math.min(1, Math.max(0, value)) * 1000) / 10;
}

export function formatProbability(value: number) {
  return `${percentFormatter.format(toPercent(value))}%`;
}

export function ProbabilityBar({ label, value, tone = "cyan" }: { label: string; value: number; tone?: ProbabilityTone }) {
  const percent = toPercent(value);

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
        <span className="min-w-0 truncate text-slate-200">{label}</span>
        <span className={`font-data shrink-0 text-xs font-bold ${valueStyles[tone]}`}>{formatProbability(value)}</span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-slate-900 ring-1 ring-slate-700/70"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${formatProbability(value)} ${label}`}
      >
        <div className={`h-full rounded-full bg-gradient-to-r ${barStyles[tone]}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
