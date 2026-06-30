"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Share2, Trophy } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useSimulatorStore } from "@/lib/store";
import type { Score, Team, TournamentState } from "@/lib/types";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";
import { TeamBadge } from "./TeamBadge";

type PredictionData = {
  id: string;
  created_at: string;
  state: {
    snapshot_id: string;
    scores: Score[];
    knockout_winners: Record<string, string>;
  };
  derived_state: TournamentState;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatSavedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Saved date unavailable";
  return dateFormatter.format(date);
}

export function PredictionClient({ predictionId }: { predictionId: string }) {
  const router = useRouter();
  const load = useSimulatorStore((state) => state.load);
  const [data, setData] = useState<PredictionData | null>(null);
  const [teamsById, setTeamsById] = useState<Record<string, Team>>({});
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all([
      apiFetch<PredictionData>(`/predictions/${predictionId}`),
      apiFetch<Team[]>("/teams").catch((): Team[] => []),
    ])
      .then(([prediction, teams]) => {
        if (!active) return;
        setData(prediction);
        setTeamsById(Object.fromEntries(teams.map((team) => [team.id, team])));
        setError("");
      })
      .catch((reason: Error) => {
        if (!active) return;
        setError(reason.message);
      })
      .finally(() => {
        if (active) setLoaded(true);
      });

    return () => {
      active = false;
    };
  }, [predictionId]);

  if (!loaded) {
    return <LoadingState label="Loading saved prediction" body="Retrieving the immutable prediction state and recalculated tournament summary." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Couldn’t load this prediction"
        message={`${error} Confirm the prediction link is correct and that the FastAPI backend can access the local SQLite database.`}
      />
    );
  }

  if (!data) {
    return (
      <ErrorState
        title="Prediction unavailable"
        message="The prediction response was empty. Try opening the simulator and saving a fresh prediction."
      />
    );
  }

  const progress = data.derived_state.progress;
  const completedMatches = progress.completed_group_matches;
  const totalMatches = progress.total_group_matches;
  const progressPercent = totalMatches ? Math.round((completedMatches / totalMatches) * 100) : 0;
  const championId = data.derived_state.champion_id;
  const champion = championId ? teamsById[championId] : undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <section className="card p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <div className="flex items-center gap-2 text-cyan-300">
              <Share2 aria-hidden="true" size={18} />
              <span className="eyebrow">Shared immutable prediction</span>
            </div>
            <h1 className="font-display mt-3 text-4xl font-bold md:text-5xl">Prediction {data.id}</h1>
            <p className="muted mt-2 leading-7">Saved {formatSavedDate(data.created_at)}</p>
          </div>
          <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
            {data.state.snapshot_id}
          </span>
        </div>

        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-slate-950/45 p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="font-data text-xs uppercase tracking-[0.16em] text-slate-500">Group-stage completion</span>
            <span className="font-data text-sm font-bold text-cyan-200">{progressPercent}%</span>
          </div>
          <div
            className="h-3 overflow-hidden rounded-full bg-slate-900 ring-1 ring-slate-700/70"
            role="progressbar"
            aria-label="Saved prediction group-stage completion"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercent}
          >
            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-300" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="muted mt-3 text-sm">
            {completedMatches} of {totalMatches} group matches include scores.
          </p>
        </div>

        <button
          type="button"
          className="button button-primary mt-6"
          onClick={() => {
            load(data.state.scores, data.state.knockout_winners, data.state.snapshot_id);
            router.push("/simulator");
          }}
        >
          <Copy aria-hidden="true" size={16} />
          Remix This Prediction
        </button>
      </section>

      <aside className="space-y-6">
        <section className="card p-6">
          <div className="flex items-center gap-2 text-amber-300">
            <Trophy aria-hidden="true" size={18} />
            <span className="font-data text-xs font-bold uppercase tracking-[0.16em]">Champion status</span>
          </div>
          {championId ? (
            <>
              <h2 className="font-display mt-3 text-3xl font-bold">Predicted champion set</h2>
              <div className="mt-5 rounded-2xl border border-amber-300/35 bg-amber-300/10 p-5">
                <span className="text-sm text-amber-100">{champion ? "Predicted champion" : "Champion team ID"}</span>
                <div className="mt-2 text-2xl font-bold">
                  {champion ? <TeamBadge team={champion} /> : <span className="font-display text-4xl">{championId}</span>}
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-display mt-3 text-3xl font-bold">Champion pending</h2>
              <p className="muted mt-2 leading-7">This saved prediction does not yet include a Match 104 winner.</p>
            </>
          )}
        </section>

        <section className="rounded-3xl border border-slate-700/70 bg-slate-950/45 p-5">
          <p className="font-data text-xs uppercase tracking-[0.16em] text-slate-500">What’s saved</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li className="rounded-2xl border border-[var(--border)] p-3">Group scores: {data.state.scores.length}</li>
            <li className="rounded-2xl border border-[var(--border)] p-3">Knockout picks: {Object.keys(data.state.knockout_winners).length}</li>
            <li className="rounded-2xl border border-[var(--border)] p-3">Qualified teams: {data.derived_state.qualified_team_ids.length}</li>
          </ul>
        </section>
      </aside>
    </div>
  );
}
