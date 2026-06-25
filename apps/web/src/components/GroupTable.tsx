import type { StandingRow, Team } from "@/lib/types";
import { TeamBadge } from "./TeamBadge";

export function GroupTable({ group, rows, teams }: { group: string; rows: StandingRow[]; teams: Record<string, Team> }) {
  return <section className="min-w-0"><div className="mb-3 flex items-center justify-between"><h3 className="font-display text-2xl font-bold">Group {group}</h3><span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-slate-400">Top 2 + best thirds advance</span></div>
    <div className="table-wrap"><table aria-label={`Group ${group} standings`}><thead><tr><th>Pos</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr></thead>
      <tbody>{rows.map((row) => <tr key={row.team_id} className={row.position <= 2 ? "bg-emerald-950/20" : row.position === 3 ? "bg-amber-950/15" : ""}><td className="font-data">{row.position}</td><td><TeamBadge team={teams[row.team_id]} compact/></td><td>{row.played}</td><td>{row.wins}</td><td>{row.draws}</td><td>{row.losses}</td><td>{row.goals_for}</td><td>{row.goals_against}</td><td>{row.goal_difference > 0 ? "+" : ""}{row.goal_difference}</td><td className="font-data font-bold text-white">{row.points}</td></tr>)}</tbody>
    </table></div></section>;
}
