export type Team = { id: string; name: string; fifa_code: string; group: string; flag_emoji: string; elo_rating: number; attack_rating: number; defense_rating: number };
export type Fixture = { id: string; group: string; matchday: number; home_team_id: string; away_team_id: string; home_score: number | null; away_score: number | null };
export type StandingRow = { team_id: string; team_name: string; group: string; position: number; played: number; wins: number; draws: number; losses: number; goals_for: number; goals_against: number; goal_difference: number; points: number };
export type ThirdPlaceRow = StandingRow & { rank: number; qualified: boolean; status: string };
export type BracketMatch = { match_id: string; round: string; team_a_id: string | null; team_b_id: string | null; winner_id?: string | null };
export type Score = { fixture_id: string; home_score: number | null; away_score: number | null };
export type TournamentState = {
  snapshot_id: string;
  progress: { completed_group_matches: number; total_group_matches: number; bracket_unlocked: boolean };
  fixtures: Fixture[];
  standings: Record<string, StandingRow[]>;
  third_place: ThirdPlaceRow[];
  qualified_team_ids: string[];
  qualification_status: Record<string, string>;
  bracket: BracketMatch[];
  champion_id: string | null;
};
export type Probability = { team_id: string; team_name: string; group: string; probability_win_group: number; probability_qualify: number; probability_round_of_16: number; probability_quarterfinal: number; probability_semifinal: number; probability_final: number; probability_champion: number };

