import type { StandingRow, Team } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { TeamBadge } from "./TeamBadge";

function standingStatus(row: StandingRow) {
  if (row.played === 0) return { label: "Pending", tone: "pending" as const };
  if (row.position <= 2) return { label: "Qualified", tone: "qualified" as const };
  if (row.position === 3) return { label: "Third-place race", tone: "race" as const };
  return { label: "Eliminated", tone: "eliminated" as const };
}

function formatGoalDifference(value: number) {
  return `${value > 0 ? "+" : ""}${value}`;
}

export function GroupTable({ group, rows, teams }: { group: string; rows: StandingRow[]; teams: Record<string, Team> }) {
  return (
    <section className="min-w-0">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-display text-2xl font-bold">Group {group} standings</h3>
        <span className="w-fit rounded-full border border-[var(--border)] px-3 py-1 text-xs text-slate-400">
          Top 2 + best thirds advance
        </span>
      </div>

      <div className="grid gap-3 md:hidden" aria-label={`Group ${group} standings summary`} role="list">
        {rows.map((row) => {
          const status = standingStatus(row);
          return (
            <article key={row.team_id} className="rounded-2xl border border-[var(--border)] bg-[#091827] p-4" role="listitem">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-1 font-data text-xs text-slate-500">#{row.position}</div>
                  <TeamBadge team={teams[row.team_id]} compact />
                </div>
                <div className="text-right">
                  <div className="font-data text-2xl font-bold text-white">{row.points}</div>
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Pts</div>
                </div>
              </div>
              <div className="mt-3">
                <StatusBadge label={status.label} tone={status.tone} />
              </div>
              <dl className="mt-4 grid grid-cols-4 gap-2 text-center text-sm">
                <div className="rounded-xl bg-slate-950/45 p-2">
                  <dt className="text-xs text-slate-500">P</dt>
                  <dd className="font-data font-bold">{row.played}</dd>
                </div>
                <div className="rounded-xl bg-slate-950/45 p-2">
                  <dt className="text-xs text-slate-500">W-D-L</dt>
                  <dd className="font-data font-bold">{row.wins}-{row.draws}-{row.losses}</dd>
                </div>
                <div className="rounded-xl bg-slate-950/45 p-2">
                  <dt className="text-xs text-slate-500">GF-GA</dt>
                  <dd className="font-data font-bold">{row.goals_for}-{row.goals_against}</dd>
                </div>
                <div className="rounded-xl bg-slate-950/45 p-2">
                  <dt className="text-xs text-slate-500">GD</dt>
                  <dd className="font-data font-bold">{formatGoalDifference(row.goal_difference)}</dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>

      <div className="table-wrap hidden md:block">
        <table aria-label={`Group ${group} standings`}>
          <thead>
            <tr>
              <th>Pos</th>
              <th>Team</th>
              <th>Status</th>
              <th>P</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GF</th>
              <th>GA</th>
              <th>GD</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const status = standingStatus(row);
              return (
                <tr key={row.team_id} className={row.position <= 2 ? "bg-emerald-950/20" : row.position === 3 ? "bg-amber-950/15" : ""}>
                  <td className="font-data">{row.position}</td>
                  <td><TeamBadge team={teams[row.team_id]} compact /></td>
                  <td><StatusBadge label={status.label} tone={status.tone} /></td>
                  <td>{row.played}</td>
                  <td>{row.wins}</td>
                  <td>{row.draws}</td>
                  <td>{row.losses}</td>
                  <td>{row.goals_for}</td>
                  <td>{row.goals_against}</td>
                  <td>{formatGoalDifference(row.goal_difference)}</td>
                  <td className="font-data font-bold text-white">{row.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
