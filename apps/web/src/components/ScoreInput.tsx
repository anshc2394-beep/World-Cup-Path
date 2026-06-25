const NON_ALPHANUMERIC_PATTERN = /[^a-z0-9]+/g;
const EDGE_DASH_PATTERN = /^-|-$/g;

function fallbackName(label: string) {
  return label.toLowerCase().replace(NON_ALPHANUMERIC_PATTERN, "-").replace(EDGE_DASH_PATTERN, "");
}

export function ScoreInput({ label, name, value, onChange, disabled = false }: { label: string; name?: string; value: number | null; onChange: (value: number | null) => void; disabled?: boolean }) {
  return <label className="block"><span className="sr-only">{label}</span><input
    aria-label={label}
    autoComplete="off"
    className="font-data h-11 w-14 rounded-xl border border-[var(--border)] bg-[#071523] text-center text-lg font-bold text-white transition-colors duration-200 focus:border-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-50"
    disabled={disabled}
    inputMode="numeric"
    min={0}
    max={20}
    name={name ?? fallbackName(label)}
    spellCheck={false}
    step={1}
    type="number"
    value={value ?? ""}
    onChange={(event) => {
      const nextValue = event.currentTarget.value;
      if (nextValue === "") {
        onChange(null);
        return;
      }
      const parsed = Number.parseInt(nextValue, 10);
      onChange(Number.isNaN(parsed) ? null : Math.max(0, Math.min(20, parsed)));
    }}
  /></label>;
}
