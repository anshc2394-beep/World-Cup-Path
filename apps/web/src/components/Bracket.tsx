import { LockKeyhole, Medal, Trophy } from "lucide-react";
import type { BracketMatch, Team } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { TeamBadge } from "./TeamBadge";

const MAIN_ROUNDS = ["Round of 32", "Round of 16", "Quarterfinal", "Semifinal", "Final"] as const;
const THIRD_PLACE_ROUND = "Third place";

type BracketRound = {
  round: string;
  matches: BracketMatch[];
};

type BracketProps = {
  matches: BracketMatch[];
  teams: Record<string, Team>;
  unlocked: boolean;
  onWinner: (matchId: string, teamId: string) => void;
};

type MatchCardProps = {
  match: BracketMatch;
  teams: Record<string, Team>;
  unlocked: boolean;
  onWinner: (matchId: string, teamId: string) => void;
  variant?: "standard" | "spotlight";
};

type BracketInteractionProps = Pick<MatchCardProps, "teams" | "unlocked" | "onWinner">;

type ChampionPanelProps = {
  finalMatch?: BracketMatch;
  champion?: Team;
  championId?: string | null;
};

export function generateRoundOf32Bracket(matches: BracketMatch[]): BracketRound[] {
  return MAIN_ROUNDS.map((round) => ({
    round,
    matches: matches.filter((match) => match.round === round),
  }));
}

function getFinalMatch(matches: BracketMatch[]) {
  return matches.find((match) => match.match_id === "104" || match.round === "Final");
}

function getThirdPlaceMatch(matches: BracketMatch[]) {
  return matches.find((match) => match.match_id === "103" || match.round === THIRD_PLACE_ROUND);
}

function isWinningSlot(match: BracketMatch, teamId: string | null) {
  return Boolean(teamId && match.winner_id === teamId);
}

function formatRoundCount(count: number) {
  return count === 1 ? "1 match" : `${count} matches`;
}

function BracketTeamButton({ match, teams, teamId, unlocked, onWinner }: MatchCardProps & { teamId: string | null }) {
  const team = teamId ? teams[teamId] : undefined;
  const selected = isWinningSlot(match, teamId);
  const disabled = !unlocked || !teamId;
  const teamLabel = team?.name ?? teamId ?? "TBD";

  return (
    <button
      type="button"
      aria-label={`Pick ${teamLabel} as winner of match ${match.match_id}`}
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => {
        if (teamId) onWinner(match.match_id, teamId);
      }}
      className={`group flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-75 ${
        selected
          ? "border-amber-300/70 bg-amber-300/12 text-white"
          : "border-slate-700/60 bg-slate-950/45 text-slate-200 hover:border-blue-400/70 hover:bg-blue-400/10"
      }`}
    >
      <span className="min-w-0">
        <TeamBadge team={team} compact />
      </span>
      {selected ? (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-300/50 bg-amber-300/15 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-amber-100">
          <Trophy aria-hidden="true" size={13} />
          Winner
        </span>
      ) : (
        <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500 group-hover:text-slate-300">
          Pick
        </span>
      )}
    </button>
  );
}

function BracketMatchCard({ match, teams, unlocked, onWinner, variant = "standard" }: MatchCardProps) {
  const hasWinner = Boolean(match.winner_id);
  const isSpotlight = variant === "spotlight";

  return (
    <article
      className={`rounded-2xl border p-3 ${
        isSpotlight
          ? "border-amber-300/35 bg-amber-300/[0.08] shadow-[0_18px_50px_rgb(245_158_11_/_10%)]"
          : "border-[var(--border)] bg-[#091827]"
      }`}
      aria-label={`Match ${match.match_id}, ${match.round}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="font-data text-[10px] uppercase tracking-[0.12em] text-slate-500">Match {match.match_id}</p>
          <h4 className="mt-0.5 text-sm font-bold text-slate-200">{match.round}</h4>
        </div>
        {hasWinner ? <StatusBadge label="Winner Set" tone="qualified" /> : <StatusBadge label="Pending" tone="pending" />}
      </div>
      <div className="space-y-2">
        {[match.team_a_id, match.team_b_id].map((teamId, index) => (
          <BracketTeamButton
            key={`${match.match_id}-${teamId ?? `slot-${index}`}`}
            match={match}
            teams={teams}
            teamId={teamId}
            unlocked={unlocked}
            onWinner={onWinner}
          />
        ))}
      </div>
    </article>
  );
}

function RoundColumn({ round, matches, teams, unlocked, onWinner }: BracketRound & BracketInteractionProps) {
  return (
    <section className="min-w-[285px] flex-1 snap-start" aria-labelledby={`bracket-round-${round.replaceAll(" ", "-").toLowerCase()}`}>
      <div className="mb-3 flex items-end justify-between gap-3 border-b border-slate-700/60 pb-3">
        <div>
          <p className="font-data text-[10px] uppercase tracking-[0.18em] text-cyan-300/80">Knockout Stage</p>
          <h3 id={`bracket-round-${round.replaceAll(" ", "-").toLowerCase()}`} className="font-display mt-1 text-2xl font-bold">
            {round}
          </h3>
        </div>
        <span className="rounded-full border border-slate-700/70 px-2.5 py-1 text-xs font-bold text-slate-300">
          {formatRoundCount(matches.length)}
        </span>
      </div>
      <div className="space-y-3">
        {matches.length ? (
          matches.map((match) => (
            <BracketMatchCard key={match.match_id} match={match} teams={teams} unlocked={unlocked} onWinner={onWinner} />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-700/70 bg-slate-950/30 p-4 text-sm text-slate-400">
            Waiting for upstream winners.
          </div>
        )}
      </div>
    </section>
  );
}

function ChampionPanel({ finalMatch, champion, championId }: ChampionPanelProps) {
  const hasFinal = Boolean(finalMatch);

  return (
    <aside className="rounded-3xl border border-amber-300/35 bg-[radial-gradient(circle_at_top_right,_rgb(245_158_11_/_18%),_transparent_18rem),rgb(8_20_36_/_92%)] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Champion Endpoint</p>
          <h3 className="font-display mt-2 text-3xl font-bold">Trophy path</h3>
        </div>
        <Trophy aria-hidden="true" className="text-amber-300" size={28} />
      </div>

      <div className="mt-6 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4">
        {champion ? (
          <>
            <StatusBadge label="Champion" tone="qualified" />
            <div className="mt-4 text-2xl font-bold">
              <TeamBadge team={champion} />
            </div>
            <p className="muted mt-3 text-sm leading-6">Match 104 has a selected winner, so the tournament story now closes from Round of 32 to champion.</p>
          </>
        ) : (
          <>
            <StatusBadge label={hasFinal ? "Final Pending" : "Path Pending"} tone="pending" />
            <p className="mt-4 text-lg font-bold text-white">{hasFinal ? "Pick the Final winner to crown a champion." : "The Final appears after the bracket is generated."}</p>
            <p className="muted mt-2 text-sm leading-6">
              {championId ? "The champion ID is present but the team catalog has not loaded that team yet." : "Complete group scores, then advance winners through Match 104."}
            </p>
          </>
        )}
      </div>
    </aside>
  );
}

function ThirdPlacePanel({ match, teams, unlocked, onWinner }: { match?: BracketMatch } & BracketInteractionProps) {
  return (
    <aside className="rounded-3xl border border-slate-700/70 bg-slate-950/40 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-data text-xs uppercase tracking-[0.16em] text-slate-500">Placement Match</p>
          <h3 className="font-display mt-1 text-2xl font-bold">Third-place match</h3>
        </div>
        <Medal aria-hidden="true" className="text-cyan-300" size={24} />
      </div>

      {match ? (
        <BracketMatchCard match={match} teams={teams} unlocked={unlocked} onWinner={onWinner} variant="spotlight" />
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-700/70 bg-slate-950/30 p-4 text-sm leading-6 text-slate-400">
          Match 103 is not present in this bracket payload. The main bracket still works; add backend/data support for the Third-place match to show it here.
        </div>
      )}
    </aside>
  );
}

export function Bracket({ matches, teams, unlocked, onWinner }: BracketProps) {
  if (!matches.length) {
    return (
      <div className="card p-8 text-center">
        <LockKeyhole aria-hidden="true" className="mx-auto mb-3 text-slate-500" />
        <h3 className="font-display text-2xl font-bold">Bracket Waiting for Predictions</h3>
        <p className="muted mt-2">Enter a group-stage result or run a full simulation to reveal projected paths.</p>
      </div>
    );
  }

  const roundGroups = generateRoundOf32Bracket(matches);
  const finalMatch = getFinalMatch(matches);
  const thirdPlaceMatch = getThirdPlaceMatch(matches);
  const championId = finalMatch?.winner_id ?? null;
  const champion = championId ? teams[championId] : undefined;

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-700/70 bg-slate-950/45 p-4 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {unlocked ? <Trophy aria-hidden="true" size={17} color="var(--amber)" /> : <LockKeyhole aria-hidden="true" size={17} />}
          <span>{unlocked ? "Winner picking unlocked" : "Projected bracket — complete all 72 group matches to pick winners"}</span>
        </div>
        <span className="font-data text-xs uppercase tracking-[0.14em] text-slate-500">Matches 73–104</span>
      </div>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="min-w-0">
          <p className="mb-3 text-sm text-slate-400 md:hidden">Swipe horizontally to follow the path from Round of 32 to the Final.</p>
          <div className="flex snap-x gap-4 overflow-x-auto pb-4">
            {roundGroups.map(({ round, matches: roundMatches }) => (
              <RoundColumn
                key={round}
                round={round}
                matches={roundMatches}
                teams={teams}
                unlocked={unlocked}
                onWinner={onWinner}
              />
            ))}
          </div>
        </div>

        <div className="grid content-start gap-4 md:grid-cols-2 xl:grid-cols-1">
          <ChampionPanel finalMatch={finalMatch} champion={champion} championId={championId} />
          <ThirdPlacePanel match={thirdPlaceMatch} teams={teams} unlocked={unlocked} onWinner={onWinner} />
        </div>
      </div>
    </div>
  );
}
