import { LockKeyhole, Trophy } from "lucide-react";
import type { BracketMatch, Team } from "@/lib/types";
import { TeamBadge } from "./TeamBadge";

const rounds = ["Round of 32", "Round of 16", "Quarterfinal", "Semifinal", "Final"];

export function generateRoundOf32Bracket(matches: BracketMatch[]) { return rounds.map((round) => ({ round, matches: matches.filter((match) => match.round === round) })); }

export function Bracket({ matches, teams, unlocked, onWinner }: { matches: BracketMatch[]; teams: Record<string, Team>; unlocked: boolean; onWinner: (matchId: string, teamId: string) => void }) {
  if (!matches.length) return <div className="card p-8 text-center"><LockKeyhole className="mx-auto mb-3 text-slate-500"/><h3 className="font-display text-2xl font-bold">Bracket waiting for predictions</h3><p className="muted mt-2">Enter a group-stage result or run a full simulation to reveal projected paths.</p></div>;
  return <div><div className="mb-4 flex items-center gap-2 text-sm text-slate-400">{unlocked ? <Trophy size={17} color="var(--amber)"/> : <LockKeyhole size={17}/>} {unlocked ? "Winner picking unlocked" : "Projected bracket — complete all 72 group matches to pick winners"}</div>
    <div className="flex snap-x gap-4 overflow-x-auto pb-4">{generateRoundOf32Bracket(matches).map(({ round, matches: roundMatches }) => <section key={round} className="min-w-[270px] flex-1 snap-start"><h3 className="font-display mb-3 text-xl font-bold">{round}</h3><div className="space-y-3">{roundMatches.map((match) => <div key={match.match_id} className="rounded-xl border border-[var(--border)] bg-[#091827] p-3"><div className="mb-2 font-data text-[10px] uppercase text-slate-500">Match {match.match_id}</div>{[match.team_a_id, match.team_b_id].map((teamId) => <button key={teamId || "tbd"} disabled={!unlocked || !teamId} onClick={() => teamId && onWinner(match.match_id, teamId)} className={`mb-1 flex w-full cursor-pointer items-center justify-between rounded-lg border px-2 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${match.winner_id === teamId ? "border-amber-400 bg-amber-400/10" : "border-transparent hover:border-blue-500"}`}><TeamBadge team={teamId ? teams[teamId] : undefined} compact/>{match.winner_id === teamId && <Trophy size={14} color="var(--amber)"/>}</button>)}</div>)}</div></section>)}</div>
  </div>;
}

