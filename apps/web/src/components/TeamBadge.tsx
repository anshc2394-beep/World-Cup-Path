import type { Team } from "@/lib/types";

export function TeamBadge({ team, compact = false }: { team?: Team; compact?: boolean }) {
  if (!team) return <span className="muted">TBD</span>;
  return <span className="inline-flex items-center gap-2"><span aria-hidden="true" className={compact ? "text-base" : "text-xl"}>{team.flag_emoji}</span><span className="font-medium">{team.name}</span>{!compact && <span className="font-data text-xs text-slate-500">{team.fifa_code}</span>}</span>;
}

