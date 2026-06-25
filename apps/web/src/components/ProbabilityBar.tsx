export function ProbabilityBar({ label, value }: { label: string; value: number }) {
  const percent = Math.round(value * 1000) / 10;
  return <div><div className="mb-1 flex justify-between text-sm"><span>{label}</span><span className="font-data text-cyan-300">{percent}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-800" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${percent}%` }}/></div></div>;
}

