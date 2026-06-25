"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, BarChart3, Play, ShieldCheck, Trophy } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiFetch } from "@/lib/api";
import type { Probability } from "@/lib/types";
import { formatProbability, ProbabilityBar, type ProbabilityTone } from "./ProbabilityBar";

type ProbabilityMetricKey =
  | "probability_champion"
  | "probability_final"
  | "probability_semifinal"
  | "probability_quarterfinal"
  | "probability_round_of_16"
  | "probability_qualify";

type ProbabilityMetric = {
  key: ProbabilityMetricKey;
  label: string;
  shortLabel: string;
  helper: string;
  tone: ProbabilityTone;
  barColor: string;
};

type SimulationControlsProps = {
  runs: number;
  setRuns: (runs: number) => void;
  group: string;
  setGroup: (group: string) => void;
  metricKey: ProbabilityMetricKey;
  setMetricKey: (key: ProbabilityMetricKey) => void;
  onRun: () => void;
  busy: boolean;
};

const GROUP_OPTIONS = "ABCDEFGHIJKL".split("");

const RANK_METRICS: ProbabilityMetric[] = [
  {
    key: "probability_champion",
    label: "Win World Cup",
    shortLabel: "Champion",
    helper: "Best view for the outright trophy race.",
    tone: "amber",
    barColor: "#f59e0b",
  },
  {
    key: "probability_final",
    label: "Reach Final",
    shortLabel: "Final",
    helper: "Shows who can survive the bracket deep into July.",
    tone: "cyan",
    barColor: "#22d3ee",
  },
  {
    key: "probability_semifinal",
    label: "Reach Semifinal",
    shortLabel: "Semifinal",
    helper: "Highlights teams with strong paths to the final 4.",
    tone: "blue",
    barColor: "#38bdf8",
  },
  {
    key: "probability_quarterfinal",
    label: "Reach Quarterfinal",
    shortLabel: "Quarterfinal",
    helper: "Compares teams most likely to reach the last 8.",
    tone: "blue",
    barColor: "#60a5fa",
  },
  {
    key: "probability_round_of_16",
    label: "Reach Round of 16",
    shortLabel: "Round of 16",
    helper: "Useful for reading early knockout survival.",
    tone: "emerald",
    barColor: "#34d399",
  },
  {
    key: "probability_qualify",
    label: "Qualify for Round of 32",
    shortLabel: "Qualify",
    helper: "Shows group-stage security and third-place risk.",
    tone: "emerald",
    barColor: "#22c55e",
  },
];

const CARD_METRICS: ProbabilityMetric[] = [
  RANK_METRICS[5],
  RANK_METRICS[4],
  RANK_METRICS[3],
  RANK_METRICS[2],
  RANK_METRICS[1],
  RANK_METRICS[0],
];

function isProbabilityMetricKey(value: string): value is ProbabilityMetricKey {
  return RANK_METRICS.some((metric) => metric.key === value);
}

function getMetric(metricKey: ProbabilityMetricKey) {
  return RANK_METRICS.find((metric) => metric.key === metricKey) ?? RANK_METRICS[0];
}

function getTopTeam(rows: Probability[], metricKey: ProbabilityMetricKey) {
  return rows.reduce<Probability | undefined>((best, row) => {
    if (!best || row[metricKey] > best[metricKey]) return row;
    if (row[metricKey] === best[metricKey] && row.team_name.localeCompare(best.team_name) < 0) return row;
    return best;
  }, undefined);
}

function formatChartLabel(value: unknown) {
  return typeof value === "number" ? formatProbability(value) : "";
}

export function SimulationControls({
  runs,
  setRuns,
  group,
  setGroup,
  metricKey,
  setMetricKey,
  onRun,
  busy,
}: SimulationControlsProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
      <label htmlFor="simulation-runs" className="text-sm font-bold text-slate-200">
        Runs
        <select
          id="simulation-runs"
          name="simulation-runs"
          autoComplete="off"
          className="mt-2 w-full rounded-xl border border-[var(--border)] bg-slate-950 px-3 py-2 text-slate-100 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          value={runs}
          onChange={(event) => setRuns(Number(event.target.value))}
        >
          <option value={100}>100</option>
          <option value={500}>500</option>
          <option value={1000}>1000</option>
          <option value={5000}>5000</option>
        </select>
      </label>

      <label htmlFor="simulation-group" className="text-sm font-bold text-slate-200">
        Group Filter
        <select
          id="simulation-group"
          name="simulation-group"
          autoComplete="off"
          className="mt-2 w-full rounded-xl border border-[var(--border)] bg-slate-950 px-3 py-2 text-slate-100 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          value={group}
          onChange={(event) => setGroup(event.target.value)}
        >
          <option value="ALL">All groups</option>
          {GROUP_OPTIONS.map((id) => (
            <option key={id} value={id}>
              Group {id}
            </option>
          ))}
        </select>
      </label>

      <label htmlFor="simulation-rank" className="text-sm font-bold text-slate-200">
        Rank By
        <select
          id="simulation-rank"
          name="simulation-rank"
          autoComplete="off"
          className="mt-2 w-full rounded-xl border border-[var(--border)] bg-slate-950 px-3 py-2 text-slate-100 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          value={metricKey}
          onChange={(event) => {
            if (isProbabilityMetricKey(event.target.value)) setMetricKey(event.target.value);
          }}
        >
          {RANK_METRICS.map((metric) => (
            <option key={metric.key} value={metric.key}>
              {metric.label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        className="button button-primary min-h-11 disabled:cursor-not-allowed disabled:opacity-65"
        disabled={busy}
        aria-busy={busy}
        onClick={onRun}
      >
        <Play aria-hidden="true" size={16} />
        {busy ? "Running…" : "Run Model"}
      </button>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div role="alert" className="mt-4 flex gap-3 rounded-2xl border border-rose-400/45 bg-rose-950/35 p-4 text-rose-100">
      <AlertTriangle aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
      <div>
        <p className="font-bold">Couldn’t run the Monte Carlo simulation.</p>
        <p className="mt-1 text-sm text-rose-100/85">{message} Check that the FastAPI backend is running, then try again.</p>
      </div>
    </div>
  );
}

function EmptySimulationState({ busy, runs }: { busy: boolean; runs: number }) {
  return (
    <section className="card mt-6 p-8 text-center md:p-12" aria-live="polite">
      <BarChart3 aria-hidden="true" className={`mx-auto text-slate-500 ${busy ? "animate-pulse" : ""}`} size={34} />
      <h2 className="font-display mt-4 text-3xl font-bold">{busy ? `Running ${runs.toLocaleString()} simulations…` : "Run the model to populate the board"}</h2>
      <p className="muted mx-auto mt-3 max-w-xl leading-7">
        {busy
          ? "The seeded model is replaying the full tournament and calculating stage-by-stage probabilities."
          : "Choose a run count, then generate ranked championship, finalist, knockout, and qualification probabilities."}
      </p>
    </section>
  );
}

function SummaryCard({ title, row, metric, icon }: { title: string; row?: Probability; metric: ProbabilityMetric; icon: "trophy" | "shield" | "chart" }) {
  const Icon = icon === "trophy" ? Trophy : icon === "shield" ? ShieldCheck : BarChart3;

  return (
    <article className="rounded-3xl border border-slate-700/70 bg-slate-950/45 p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="font-data text-xs uppercase tracking-[0.16em] text-slate-500">{title}</p>
        <Icon aria-hidden="true" className={metric.tone === "amber" ? "text-amber-300" : "text-cyan-300"} size={21} />
      </div>
      {row ? (
        <>
          <h3 className="min-w-0 truncate font-display text-3xl font-bold">{row.team_name}</h3>
          <div className="mt-3 flex items-baseline justify-between gap-3">
            <span className="text-sm text-slate-400">Group {row.group}</span>
            <span className="font-data text-2xl font-bold text-white">{formatProbability(row[metric.key])}</span>
          </div>
          <p className="muted mt-3 text-sm leading-6">{metric.helper}</p>
        </>
      ) : (
        <p className="muted text-sm leading-6">Run the model to reveal this takeaway.</p>
      )}
    </article>
  );
}

function ProbabilityChart({ rows, metric }: { rows: Probability[]; metric: ProbabilityMetric }) {
  const chartRows = rows.slice(0, 10);
  const chartHeight = Math.max(340, chartRows.length * 42 + 76);

  if (!chartRows.length) {
    return (
      <section className="card mt-6 p-6">
        <h2 className="font-display text-3xl font-bold">Ranked probability chart</h2>
        <p className="muted mt-2">No teams match the current filter.</p>
      </section>
    );
  }

  return (
    <section className="card mt-6 p-4 md:p-6" aria-labelledby="probability-chart-title">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Ranked board</p>
          <h2 id="probability-chart-title" className="font-display mt-2 text-3xl font-bold">
            Top {chartRows.length} by {metric.shortLabel}
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-slate-400">{metric.helper} Percent labels are shown directly on each bar.</p>
      </div>

      <div
        className="mt-5 min-w-0"
        style={{ height: chartHeight }}
        role="img"
        aria-label={`Top ${chartRows.length} teams ranked by ${metric.label.toLowerCase()}.`}
      >
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={320}>
          <BarChart data={chartRows} layout="vertical" margin={{ top: 8, right: 52, bottom: 8, left: 4 }}>
            <CartesianGrid stroke="#243b58" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 1]}
              tickFormatter={(value) => formatProbability(Number(value))}
              stroke="#94a3b8"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="team_name"
              width={122}
              stroke="#cbd5e1"
              tick={{ fill: "#cbd5e1", fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => [formatProbability(Number(value)), metric.label]}
              contentStyle={{ background: "#0c1a2b", border: "1px solid #243b58", borderRadius: "12px", color: "#f8fafc" }}
              cursor={{ fill: "rgb(59 130 246 / 8%)" }}
            />
            <Bar dataKey={metric.key} fill={metric.barColor} radius={[0, 7, 7, 0]}>
              <LabelList dataKey={metric.key} position="right" formatter={formatChartLabel} fill="#e2e8f0" fontSize={12} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function TeamProbabilityCard({ row, rank }: { row: Probability; rank: number }) {
  return (
    <article className="card p-5">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-data text-xs uppercase tracking-[0.16em] text-slate-500">Rank #{rank}</p>
          <h3 className="font-display mt-1 truncate text-2xl font-bold">{row.team_name}</h3>
        </div>
        <span className="shrink-0 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">Group {row.group}</span>
      </div>

      <div className="space-y-3.5">
        {CARD_METRICS.map((metric) => (
          <ProbabilityBar key={metric.key} label={metric.shortLabel} value={row[metric.key]} tone={metric.tone} />
        ))}
      </div>
    </article>
  );
}

function ProbabilityTable({ rows }: { rows: Probability[] }) {
  return (
    <section className="card mt-6 p-4 md:p-6" aria-labelledby="probability-table-title">
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Text summary</p>
          <h2 id="probability-table-title" className="font-display mt-2 text-3xl font-bold">
            Stage-by-stage probabilities
          </h2>
        </div>
        <p className="text-sm text-slate-400">Top {Math.min(rows.length, 10)} teams in the current ranking.</p>
      </div>

      <div className="table-wrap mt-5">
        <table aria-label="Ranked Monte Carlo probabilities">
          <thead>
            <tr>
              <th scope="col">Rank</th>
              <th scope="col">Team</th>
              <th scope="col">Group</th>
              <th scope="col">Qualify</th>
              <th scope="col">R16</th>
              <th scope="col">QF</th>
              <th scope="col">SF</th>
              <th scope="col">Final</th>
              <th scope="col">Champion</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 10).map((row, index) => (
              <tr key={row.team_id}>
                <td>#{index + 1}</td>
                <td className="font-bold text-slate-100">{row.team_name}</td>
                <td>{row.group}</td>
                <td>{formatProbability(row.probability_qualify)}</td>
                <td>{formatProbability(row.probability_round_of_16)}</td>
                <td>{formatProbability(row.probability_quarterfinal)}</td>
                <td>{formatProbability(row.probability_semifinal)}</td>
                <td>{formatProbability(row.probability_final)}</td>
                <td className="font-bold text-amber-200">{formatProbability(row.probability_champion)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function SimulationsClient() {
  const [runs, setRuns] = useState(500);
  const [group, setGroup] = useState("ALL");
  const [metricKey, setMetricKey] = useState<ProbabilityMetricKey>("probability_champion");
  const [rows, setRows] = useState<Probability[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const filteredRows = useMemo(() => rows.filter((row) => group === "ALL" || row.group === group), [rows, group]);
  const selectedMetric = getMetric(metricKey);
  const rankedRows = useMemo(
    () => [...filteredRows].sort((a, b) => b[metricKey] - a[metricKey] || a.team_name.localeCompare(b.team_name)),
    [filteredRows, metricKey],
  );
  const championFavorite = useMemo(() => getTopTeam(filteredRows, "probability_champion"), [filteredRows]);
  const finalistFavorite = useMemo(() => getTopTeam(filteredRows, "probability_final"), [filteredRows]);
  const qualifierFavorite = useMemo(() => getTopTeam(filteredRows, "probability_qualify"), [filteredRows]);

  async function run() {
    setBusy(true);
    setError("");

    try {
      const result = await apiFetch<{ teams: Probability[] }>(`/simulations/monte-carlo?runs=${runs}&seed=2026`);
      setRows(result.teams);
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="shell py-10">
      <p className="eyebrow">Monte Carlo lab</p>
      <div className="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="font-display text-5xl font-bold md:text-6xl">Tournament probabilities</h1>
          <p className="muted mt-3 max-w-2xl leading-7">
            Run seeded tournaments through the Poisson model, then compare championship, finalist, knockout, and qualification paths.
          </p>
        </div>
        {rows.length ? (
          <div className="rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
            Showing <span className="font-data font-bold">{rankedRows.length}</span> of <span className="font-data font-bold">{rows.length}</span> teams
          </div>
        ) : null}
      </div>

      <section className="card mt-8 p-5" aria-labelledby="simulation-controls-title">
        <div className="mb-4 flex flex-col justify-between gap-2 md:flex-row md:items-end">
          <div>
            <h2 id="simulation-controls-title" className="font-display text-2xl font-bold">
              Simulation controls
            </h2>
            <p className="muted mt-1 text-sm">Seed fixed at 2026 for repeatable local results.</p>
          </div>
          <span className="font-data text-xs uppercase tracking-[0.14em] text-slate-500">100–5,000 runs</span>
        </div>
        <SimulationControls
          runs={runs}
          setRuns={setRuns}
          group={group}
          setGroup={setGroup}
          metricKey={metricKey}
          setMetricKey={setMetricKey}
          onRun={run}
          busy={busy}
        />
        <ErrorBanner message={error} />
      </section>

      {!rows.length ? (
        <EmptySimulationState busy={busy} runs={runs} />
      ) : (
        <div aria-busy={busy}>
          <section className="mt-6 grid gap-4 md:grid-cols-3" aria-label="Monte Carlo takeaways">
            <SummaryCard title="World Cup favorite" row={championFavorite} metric={RANK_METRICS[0]} icon="trophy" />
            <SummaryCard title="Best finalist odds" row={finalistFavorite} metric={RANK_METRICS[1]} icon="chart" />
            <SummaryCard title="Safest qualifier" row={qualifierFavorite} metric={RANK_METRICS[5]} icon="shield" />
          </section>

          <ProbabilityChart rows={rankedRows} metric={selectedMetric} />

          {rankedRows.length ? (
            <>
              <section className="mt-6" aria-labelledby="probability-cards-title">
                <div className="mb-4 flex flex-col justify-between gap-2 md:flex-row md:items-end">
                  <div>
                    <p className="eyebrow">Team cards</p>
                    <h2 id="probability-cards-title" className="font-display mt-2 text-3xl font-bold">
                      Full path probability cards
                    </h2>
                  </div>
                  <p className="text-sm text-slate-400">Each card uses the same 0–100% scale.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {rankedRows.slice(0, 12).map((row, index) => (
                    <TeamProbabilityCard key={row.team_id} row={row} rank={index + 1} />
                  ))}
                </div>
              </section>
              <ProbabilityTable rows={rankedRows} />
            </>
          ) : (
            <section className="card mt-6 p-8 text-center">
              <h2 className="font-display text-3xl font-bold">No teams match this filter</h2>
              <p className="muted mt-2">Choose another group or switch back to all groups.</p>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
