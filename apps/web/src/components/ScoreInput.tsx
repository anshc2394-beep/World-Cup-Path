export function ScoreInput({ label, value, onChange, disabled = false }: { label: string; value: number | null; onChange: (value: number | null) => void; disabled?: boolean }) {
  return <label><span className="sr-only">{label}</span><input
    aria-label={label}
    className="font-data h-10 w-12 rounded-lg border border-[var(--border)] bg-[#071523] text-center text-lg font-bold focus:border-cyan-400 disabled:opacity-50"
    disabled={disabled}
    inputMode="numeric"
    min={0}
    max={20}
    type="number"
    value={value ?? ""}
    onChange={(event) => onChange(event.target.value === "" ? null : Math.max(0, Math.min(20, Number(event.target.value))))}
  /></label>;
}
