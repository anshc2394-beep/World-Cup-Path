import type { Fixture, Score, Team } from "@/lib/types";
import { ScoreInput } from "./ScoreInput";
import { TeamBadge } from "./TeamBadge";

export function MatchCard({ fixture, teams, score, onScore }: { fixture: Fixture; teams: Record<string, Team>; score?: Score; onScore: (side: "home_score" | "away_score", value: number | null) => void }) {
  return <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl border border-[var(--border)] bg-[#091827] p-3">
    <div className="min-w-0"><TeamBadge team={teams[fixture.home_team_id]} compact/></div>
    <div className="flex items-center gap-2"><ScoreInput label={`${teams[fixture.home_team_id]?.name} score`} value={score?.home_score ?? fixture.home_score} onChange={(v) => onScore("home_score", v)}/><span className="muted">–</span><ScoreInput label={`${teams[fixture.away_team_id]?.name} score`} value={score?.away_score ?? fixture.away_score} onChange={(v) => onScore("away_score", v)}/></div>
    <div className="min-w-0 text-right"><TeamBadge team={teams[fixture.away_team_id]} compact/></div>
  </div>;
}

