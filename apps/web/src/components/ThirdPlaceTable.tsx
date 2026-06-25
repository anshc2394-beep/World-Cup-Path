import { CheckCircle2, XCircle } from "lucide-react";
import type { Team, ThirdPlaceRow } from "@/lib/types";
import { TeamBadge } from "./TeamBadge";

export function ThirdPlaceTable({ rows, teams }: { rows: ThirdPlaceRow[]; teams: Record<string, Team> }) {
  return <div className="table-wrap"><table aria-label="Third-place qualification ranking"><thead><tr><th>Rank</th><th>Team</th><th>Group</th><th>Pts</th><th>GD</th><th>GF</th><th>Status</th></tr></thead><tbody>{rows.map((row) => {
    const waiting = row.status === "unstarted";
    const status = waiting ? "Awaiting predictions" : row.status === "projected" ? "Projected" : row.qualified ? "Qualified" : "Eliminated";
    return <tr key={row.team_id} className={waiting ? "" : row.qualified ? "bg-emerald-950/25" : "bg-rose-950/10"}><td>{row.rank}</td><td><TeamBadge team={teams[row.team_id]} compact/></td><td>{row.group}</td><td>{row.points}</td><td>{row.goal_difference > 0 ? "+" : ""}{row.goal_difference}</td><td>{row.goals_for}</td><td><span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-bold ${waiting ? "bg-slate-800 text-slate-300" : row.qualified ? "status-qualified" : "status-eliminated"}`}>{waiting ? null : row.qualified ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} {status}</span></td></tr>;
  })}</tbody></table></div>;
}

