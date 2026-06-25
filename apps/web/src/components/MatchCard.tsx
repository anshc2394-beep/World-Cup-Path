import type { Fixture, Score, Team } from "@/lib/types";
import { ScoreInput } from "./ScoreInput";
import { TeamBadge } from "./TeamBadge";

export function MatchCard({
  fixture,
  teams,
  score,
  onScore,
}: {
  fixture: Fixture;
  teams: Record<string, Team>;
  score?: Score;
  onScore: (side: "home_score" | "away_score", value: number | null) => void;
}) {
  const homeTeam = teams[fixture.home_team_id];
  const awayTeam = teams[fixture.away_team_id];

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[#091827] p-3 shadow-[0_12px_30px_rgb(0_0_0_/_12%)]">
      <div className="mb-3 flex items-center justify-between gap-3 text-xs text-slate-400">
        <span className="font-data uppercase tracking-[0.12em]">Matchday {fixture.matchday}</span>
        <span>Group {fixture.group}</span>
      </div>
      <div className="grid items-center gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div className="min-w-0 rounded-xl bg-slate-950/35 px-3 py-2">
          <TeamBadge team={homeTeam} compact />
        </div>
        <div
          aria-label={`Predicted score for ${homeTeam?.name ?? "home team"} versus ${awayTeam?.name ?? "away team"}`}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-700/70 bg-[#071523] p-2"
        >
          <ScoreInput
            label={`${homeTeam?.name ?? "Home team"} score`}
            name={`${fixture.id}-home-score`}
            value={score?.home_score ?? fixture.home_score}
            onChange={(value) => onScore("home_score", value)}
          />
          <span aria-hidden="true" className="muted font-data">–</span>
          <ScoreInput
            label={`${awayTeam?.name ?? "Away team"} score`}
            name={`${fixture.id}-away-score`}
            value={score?.away_score ?? fixture.away_score}
            onChange={(value) => onScore("away_score", value)}
          />
        </div>
        <div className="min-w-0 rounded-xl bg-slate-950/35 px-3 py-2 sm:text-right">
          <TeamBadge team={awayTeam} compact />
        </div>
      </div>
    </article>
  );
}
