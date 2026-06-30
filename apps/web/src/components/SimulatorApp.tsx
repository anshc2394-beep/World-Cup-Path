"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Save, Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useSimulatorStore } from "@/lib/store";
import type { Fixture, Team, TournamentState } from "@/lib/types";
import { Bracket } from "./Bracket";
import { ErrorState } from "./ErrorState";
import { GroupTable } from "./GroupTable";
import { LoadingState } from "./LoadingState";
import { MatchCard } from "./MatchCard";
import { ThirdPlaceTable } from "./ThirdPlaceTable";

type Section = "all" | "groups" | "third" | "bracket";

const GROUP_IDS = "ABCDEFGHIJKL".split("");

export function SimulatorApp({ section = "all", initialGroup = "A" }: { section?: Section; initialGroup?: string }) {
  const router = useRouter();
  const { snapshotId, scores, winners, setScore, setWinner, load, reset } = useSimulatorStore();
  const [teams, setTeams] = useState<Team[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [state, setState] = useState<TournamentState | null>(null);
  const [group, setGroup] = useState(() => {
    const requestedGroup = initialGroup.toUpperCase();
    return GROUP_IDS.includes(requestedGroup) ? requestedGroup : "A";
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const teamMap = useMemo(() => Object.fromEntries(teams.map((team) => [team.id, team])), [teams]);
  const completeScores = useMemo(() => Object.values(scores).filter((score) => score.home_score !== null && score.away_score !== null), [scores]);

  useEffect(() => {
    Promise.all([apiFetch<Team[]>("/teams"), apiFetch<Fixture[]>(`/fixtures?snapshot_id=${snapshotId}`)])
      .then(([teamData, fixtureData]) => { setTeams(teamData); setFixtures(fixtureData); })
      .catch((reason: Error) => setError(reason.message));
  }, [snapshotId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      apiFetch<TournamentState>("/tournament/preview", { method: "POST", body: JSON.stringify({ snapshot_id: snapshotId, scores: completeScores, knockout_winners: winners }) })
        .then((data) => { setState(data); setError(null); })
        .catch((reason: Error) => setError(reason.message));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [snapshotId, completeScores, winners]);

  async function simulate() {
    setBusy(true); setError(null);
    try {
      const result = await apiFetch<TournamentState & { group_scores: typeof completeScores; knockout_winners: Record<string, string> }>(`/simulate/tournament?snapshot_id=${snapshotId}`, { method: "POST" });
      load(result.group_scores, result.knockout_winners, snapshotId); setState(result);
    } catch (reason) { setError((reason as Error).message); } finally { setBusy(false); }
  }

  async function save() {
    setBusy(true); setError(null);
    try {
      const result = await apiFetch<{ id: string }>("/predictions", { method: "POST", body: JSON.stringify({ snapshot_id: snapshotId, scores: completeScores, knockout_winners: winners }) });
      router.push(`/predictions/${result.id}`);
    } catch (reason) { setError((reason as Error).message); } finally { setBusy(false); }
  }

  if (!teams.length || !fixtures.length || !state) {
    if (error) {
      return (
        <div className="shell py-12">
          <ErrorState
            title="Couldn’t load the simulator"
            message={`${error} Check that the FastAPI backend is running, then refresh the page.`}
          />
        </div>
      );
    }

    return <div className="shell py-12"><LoadingState /></div>;
  }
  const groupFixtures = fixtures.filter((fixture) => fixture.group === group);

  return (
    <div className="shell py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Official pre-tournament snapshot</p>
          <h1 className="font-display mt-2 text-4xl font-bold md:text-6xl">Build your path to the trophy</h1>
          <p className="muted mt-2">{state.progress.completed_group_matches} of {state.progress.total_group_matches} group matches complete</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="button button-secondary" onClick={() => { reset(); setState(null); }}>
            <RotateCcw aria-hidden="true" size={16} /> Reset
          </button>
          <button type="button" className="button button-secondary" disabled={busy} onClick={simulate}>
            <Sparkles aria-hidden="true" size={16} /> {busy ? "Simulating…" : "Simulate tournament"}
          </button>
          <button type="button" className="button button-primary" disabled={busy} onClick={save}>
            <Save aria-hidden="true" size={16} /> Save & share
          </button>
        </div>
      </div>

      {error && <div role="alert" className="mb-6 rounded-xl border border-rose-400/50 bg-rose-950/30 p-4 text-rose-200"><b>Couldn’t update the tournament.</b> {error}</div>}

      {(section === "all" || section === "groups") && (
        <section className="card p-4 md:p-6">
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="font-data text-xs uppercase tracking-[0.16em] text-slate-500">Choose a group</span>
              <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">Group {group}</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Choose World Cup group">
              {GROUP_IDS.map((id) => {
                const selected = group === id;
                return (
                  <button
                    type="button"
                    aria-label={`Show Group ${id}`}
                    aria-pressed={selected}
                    key={id}
                    onClick={() => setGroup(id)}
                    className={`min-w-11 cursor-pointer rounded-xl border px-3 py-2 font-data text-sm font-bold transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${selected ? "border-cyan-300/50 bg-cyan-300/15 text-cyan-50" : "border-[var(--border)] bg-slate-950/70 text-slate-400 hover:border-blue-500/60 hover:text-white"}`}
                  >
                    {id}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid min-w-0 gap-6 xl:grid-cols-[1fr_1.15fr]">
            <div className="min-w-0">
              <h2 className="font-display mb-3 text-2xl font-bold">Group {group} matches</h2>
              <div className="space-y-3">
                {groupFixtures.map((fixture) => (
                  <MatchCard key={fixture.id} fixture={fixture} teams={teamMap} score={scores[fixture.id]} onScore={(side, value) => setScore(fixture.id, side, value)} />
                ))}
              </div>
            </div>
            <GroupTable group={group} rows={state.standings[group]} teams={teamMap} />
          </div>
        </section>
      )}

      {(section === "all" || section === "third") && <section className="mt-8 card p-4 md:p-6"><p className="eyebrow">The qualification cut line</p><h2 className="font-display mb-4 mt-2 text-3xl font-bold">Best third-place teams</h2><ThirdPlaceTable rows={state.third_place} teams={teamMap} /></section>}
      {(section === "all" || section === "bracket") && <section className="mt-8 card p-4 md:p-6"><p className="eyebrow">Official FIFA structure</p><h2 className="font-display mb-4 mt-2 text-3xl font-bold">Knockout bracket</h2><Bracket matches={state.bracket} teams={teamMap} unlocked={state.progress.bracket_unlocked} onWinner={setWinner} /></section>}
    </div>
  );
}
