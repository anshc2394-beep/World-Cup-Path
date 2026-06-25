import type { Team, ThirdPlaceRow } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { TeamBadge } from "./TeamBadge";

function thirdPlaceStatus(row: ThirdPlaceRow) {
  if (row.status === "unstarted") return { label: "Pending", tone: "pending" as const };
  if (row.qualified) return { label: "Qualified", tone: "qualified" as const };
  return { label: "Eliminated", tone: "eliminated" as const };
}

function formatGoalDifference(value: number) {
  return `${value > 0 ? "+" : ""}${value}`;
}

export function ThirdPlaceTable({ rows, teams }: { rows: ThirdPlaceRow[]; teams: Record<string, Team> }) {
  return (
    <>
      <div className="grid gap-3 md:hidden" aria-label="Third-place qualification ranking summary" role="list">
        {rows.map((row) => {
          const status = thirdPlaceStatus(row);
          return (
            <article key={row.team_id} className={`rounded-2xl border bg-[#091827] p-4 ${row.rank === 9 ? "border-amber-300/50" : "border-[var(--border)]"}`} role="listitem">
              {row.rank === 9 ? <div className="mb-3 font-data text-[10px] uppercase tracking-[0.16em] text-amber-200">Qualification cut line</div> : null}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-1 font-data text-xs text-slate-500">Rank #{row.rank} · Group {row.group}</div>
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
              <dl className="mt-4 grid grid-cols-2 gap-2 text-center text-sm">
                <div className="rounded-xl bg-slate-950/45 p-2">
                  <dt className="text-xs text-slate-500">Goal Difference</dt>
                  <dd className="font-data font-bold">{formatGoalDifference(row.goal_difference)}</dd>
                </div>
                <div className="rounded-xl bg-slate-950/45 p-2">
                  <dt className="text-xs text-slate-500">Goals For</dt>
                  <dd className="font-data font-bold">{row.goals_for}</dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>

      <div className="table-wrap hidden md:block">
        <table aria-label="Third-place qualification ranking">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Team</th>
              <th>Group</th>
              <th>Pts</th>
              <th>GD</th>
              <th>GF</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const status = thirdPlaceStatus(row);
              return (
                <tr key={row.team_id} className={row.status === "unstarted" ? "" : row.qualified ? "bg-emerald-950/25" : "bg-rose-950/10"}>
                  <td className={`font-data ${row.rank === 9 ? "border-t-2 border-amber-300/50" : ""}`}>{row.rank}</td>
                  <td className={row.rank === 9 ? "border-t-2 border-amber-300/50" : ""}><TeamBadge team={teams[row.team_id]} compact /></td>
                  <td className={row.rank === 9 ? "border-t-2 border-amber-300/50" : ""}>{row.group}</td>
                  <td className={row.rank === 9 ? "border-t-2 border-amber-300/50" : ""}>{row.points}</td>
                  <td className={row.rank === 9 ? "border-t-2 border-amber-300/50" : ""}>{formatGoalDifference(row.goal_difference)}</td>
                  <td className={row.rank === 9 ? "border-t-2 border-amber-300/50" : ""}>{row.goals_for}</td>
                  <td className={row.rank === 9 ? "border-t-2 border-amber-300/50" : ""}><StatusBadge label={status.label} tone={status.tone} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
