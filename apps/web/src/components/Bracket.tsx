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
  variant?: "standard" | "spotlight" | "final";
};

type BracketInteractionProps = Pick<MatchCardProps, "teams" | "unlocked" | "onWinner">;

type ChampionSummaryProps = {
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

function roundAnchorId(round: string) {
  return `bracket-round-${round.replaceAll(" ", "-").toLowerCase()}`;
}

function getTeamDisplayName(teams: Record<string, Team>, teamId: string | null) {
  if (!teamId) return "TBD";
  return teams[teamId]?.name ?? teamId;
}

function SummaryTeamSlot({ label, teamId, teams }: { label: string; teamId: string | null; teams: Record<string, Team> }) {
  const team = teamId ? teams[teamId] : undefined;

  return (
    <div className="rounded-xl border border-slate-700/55 bg-slate-950/35 px-3 py-2">
      <p className="font-data text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <div className="mt-1 min-w-0 text-sm text-slate-100">
        {team ? <TeamBadge team={team} compact /> : <span className="muted">{teamId ?? "TBD"}</span>}
      </div>
    </div>
  );
}

function BracketTeamButton({ match, teams, teamId, unlocked, onWinner }: MatchCardProps & { teamId: string | null }) {
  const team = teamId ? teams[teamId] : undefined;
  const selected = isWinningSlot(match, teamId);
  const disabled = !unlocked || !teamId;
  const teamLabel = getTeamDisplayName(teams, teamId);

  return (
    <button
      type="button"
      aria-label={`Pick ${teamLabel} as winner of match ${match.match_id}`}
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => {
        if (teamId) onWinner(match.match_id, teamId);
      }}
      className={`group flex min-h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-75 ${
        selected
          ? "border-amber-300/60 bg-amber-300/12 text-white"
          : "border-slate-700/45 bg-slate-950/35 text-slate-200 hover:border-cyan-300/55 hover:bg-cyan-300/10"
      }`}
    >
      <span className="min-w-0">
        <TeamBadge team={team} compact />
      </span>
      {selected ? (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-300/45 bg-amber-300/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-amber-100">
          <Trophy aria-hidden="true" size={12} />
          Winner
        </span>
      ) : (
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 group-hover:text-slate-300">
          Pick
        </span>
      )}
    </button>
  );
}

function BracketMatchCard({ match, teams, unlocked, onWinner, variant = "standard" }: MatchCardProps) {
  const hasWinner = Boolean(match.winner_id);
  const isFinal = variant === "final";
  const isSpotlight = variant === "spotlight";

  return (
    <article
      className={`rounded-xl border p-2.5 transition-colors ${
        isFinal
          ? "border-amber-300/35 bg-amber-300/[0.08]"
          : isSpotlight
            ? "border-cyan-300/25 bg-cyan-300/[0.06]"
            : "border-slate-700/45 bg-slate-950/25"
      }`}
      aria-label={`Match ${match.match_id}, ${match.round}`}
    >
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-data text-[10px] uppercase tracking-[0.12em] text-slate-500">Match {match.match_id}</p>
          <h4 className="mt-0.5 truncate text-sm font-bold text-slate-100">{match.round}</h4>
        </div>
        {hasWinner ? <StatusBadge label="Winner Set" tone="qualified" /> : <StatusBadge label="Pending" tone="pending" />}
      </div>
      <div className="space-y-1.5">
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
  const id = roundAnchorId(round);
  const isFinalRound = round === "Final";

  return (
    <section
      className="min-w-0 rounded-2xl border border-slate-800/70 bg-slate-950/20 p-3 lg:border-0 lg:bg-transparent lg:p-0"
      aria-labelledby={id}
    >
      <div className="mb-3 border-b border-slate-700/45 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-data text-[10px] uppercase tracking-[0.18em] text-cyan-300/80">Knockout Stage</p>
            <h3 id={id} className="font-display mt-1 truncate text-2xl font-bold">
              {round}
            </h3>
          </div>
          <span className="rounded-full border border-slate-700/60 bg-slate-950/35 px-2.5 py-1 text-xs font-bold text-slate-300">
            {formatRoundCount(matches.length)}
          </span>
        </div>
      </div>
      <div className="space-y-2.5">
        {matches.length ? (
          matches.map((match) => (
            <BracketMatchCard
              key={match.match_id}
              match={match}
              teams={teams}
              unlocked={unlocked}
              onWinner={onWinner}
              variant={isFinalRound ? "final" : "standard"}
            />
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-700/65 bg-slate-950/25 p-4 text-sm text-slate-400">
            Waiting for upstream winners.
          </div>
        )}
      </div>
    </section>
  );
}

function ChampionSummary({ finalMatch, champion, championId }: ChampionSummaryProps) {
  const hasFinal = Boolean(finalMatch);

  return (
    <article className="rounded-2xl border border-amber-300/25 bg-[radial-gradient(circle_at_top_right,_rgb(245_158_11_/_16%),_transparent_13rem),rgb(15_23_42_/_28%)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-data text-[10px] uppercase tracking-[0.16em] text-amber-200">Champion</p>
          <h3 className="font-display mt-1 text-2xl font-bold">Trophy endpoint</h3>
        </div>
        <Trophy aria-hidden="true" className="text-amber-300" size={24} />
      </div>

      <div className="mt-4">
        {champion ? (
          <>
            <StatusBadge label="Champion" tone="qualified" />
            <div className="mt-3 min-w-0 text-xl font-bold">
              <TeamBadge team={champion} />
            </div>
            <p className="muted mt-2 text-sm leading-6">Match 104 has a winner, so the path now closes with a champion.</p>
          </>
        ) : (
          <>
            <StatusBadge label={hasFinal ? "Final Pending" : "Path Pending"} tone="pending" />
            <p className="mt-3 text-base font-bold text-white">{hasFinal ? "Pick the Final winner to crown a champion." : "Generate the Final to unlock the endpoint."}</p>
            <p className="muted mt-2 text-sm leading-6">
              {championId ? "A champion ID exists, but that team is not currently in the loaded catalog." : "Complete the group stage, then advance winners through Match 104."}
            </p>
          </>
        )}
      </div>
    </article>
  );
}

function FinalSummary({ match, teams }: { match?: BracketMatch; teams: Record<string, Team> }) {
  const winner = match?.winner_id ? teams[match.winner_id] : undefined;

  return (
    <article className="rounded-2xl border border-slate-700/55 bg-slate-950/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-data text-[10px] uppercase tracking-[0.16em] text-cyan-300/80">Match 104</p>
          <h3 className="font-display mt-1 text-2xl font-bold">Final</h3>
        </div>
        {match?.winner_id ? <StatusBadge label="Winner Set" tone="qualified" /> : <StatusBadge label="Pending" tone="pending" />}
      </div>

      {match ? (
        <>
          <div className="mt-4 grid gap-2">
            <SummaryTeamSlot label="Finalist A" teamId={match.team_a_id} teams={teams} />
            <SummaryTeamSlot label="Finalist B" teamId={match.team_b_id} teams={teams} />
          </div>
          <p className="muted mt-3 text-sm leading-6">
            {winner ? (
              <>
                Winner: <span className="font-bold text-white">{winner.name}</span>
              </>
            ) : (
              "Select the Final winner in the bracket column below."
            )}
          </p>
        </>
      ) : (
        <p className="muted mt-4 text-sm leading-6">The Final appears after the knockout bracket is generated.</p>
      )}
    </article>
  );
}

function ThirdPlaceSummary({ match, teams, unlocked, onWinner }: { match?: BracketMatch } & BracketInteractionProps) {
  return (
    <article className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.04] p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-data text-[10px] uppercase tracking-[0.16em] text-cyan-300/80">Match 103</p>
          <h3 className="font-display mt-1 text-2xl font-bold">Third-place</h3>
        </div>
        <Medal aria-hidden="true" className="text-cyan-300" size={23} />
      </div>

      {match ? (
        <BracketMatchCard match={match} teams={teams} unlocked={unlocked} onWinner={onWinner} variant="spotlight" />
      ) : (
        <div className="rounded-xl border border-dashed border-slate-700/65 bg-slate-950/25 p-4 text-sm leading-6 text-slate-400">
          Match 103 is not present in this bracket payload. The main bracket still works; add data support for the Third-place match to show it here.
        </div>
      )}
    </article>
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
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-700/55 bg-slate-950/35 p-4 md:p-5" aria-labelledby="tournament-path-heading">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Tournament path</p>
            <h3 id="tournament-path-heading" className="font-display mt-2 text-3xl font-bold">
              Round of 32 to trophy
            </h3>
            <p className="muted mt-2 max-w-2xl text-sm leading-6">
              {unlocked
                ? "Winner picking is unlocked. Advance teams through the bracket and close the story with Match 104."
                : "Projected bracket only. Complete all 72 group matches to unlock manual winner picks."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={unlocked ? "Winner picking unlocked" : "Picks locked"} tone={unlocked ? "qualified" : "pending"} />
            <span className="rounded-full border border-slate-700/60 bg-slate-950/35 px-3 py-1 text-xs font-bold text-slate-300">
              Matches 73-104
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr_1.15fr]">
          <ChampionSummary finalMatch={finalMatch} champion={champion} championId={championId} />
          <FinalSummary match={finalMatch} teams={teams} />
          <ThirdPlaceSummary match={thirdPlaceMatch} teams={teams} unlocked={unlocked} onWinner={onWinner} />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-700/45 bg-slate-950/20 p-3 md:p-4" aria-labelledby="knockout-rounds-heading">
        <div className="flex flex-col gap-2 border-b border-slate-700/45 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-data text-[10px] uppercase tracking-[0.18em] text-cyan-300/80">Bracket board</p>
            <h3 id="knockout-rounds-heading" className="font-display mt-1 text-2xl font-bold">
              Knockout rounds
            </h3>
          </div>
          <p className="muted text-sm">Desktop shows the full path; mobile stacks each round for easier scanning.</p>
        </div>

        <div className="mt-4 grid min-w-0 gap-4 md:grid-cols-2 lg:grid-cols-[minmax(220px,1.2fr)_minmax(210px,1fr)_minmax(200px,0.95fr)_minmax(190px,0.85fr)_minmax(180px,0.75fr)]">
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
      </section>
    </div>
  );
}
