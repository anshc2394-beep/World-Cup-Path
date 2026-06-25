"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Fixture, Team } from "@/lib/types";
import { LoadingState } from "./LoadingState";
import { ProbabilityBar } from "./ProbabilityBar";
import { TeamBadge } from "./TeamBadge";
import { TeamPathExplanation } from "./TeamPathExplanation";

type TeamDetail = Team & { fixtures: Fixture[] };
export function TeamClient({ teamId }: { teamId: string }) { const [team, setTeam] = useState<TeamDetail | null>(null); const [explanation, setExplanation] = useState<{ headline: string; summary: string } | null>(null); useEffect(() => { Promise.all([apiFetch<TeamDetail>(`/teams/${teamId}`), apiFetch<{headline:string;summary:string}>(`/teams/${teamId}/explanation`)]).then(([t,e]) => {setTeam(t);setExplanation(e);}); }, [teamId]); if (!team || !explanation) return <LoadingState/>; return <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]"><div><div className="card p-6"><TeamBadge team={team}/><h1 className="font-display mt-5 text-5xl font-bold">Group {team.group} contender</h1><div className="mt-5 grid grid-cols-3 gap-3">{[["Elo",team.elo_rating],["Attack",team.attack_rating],["Defense",team.defense_rating]].map(([label,value]) => <div key={label} className="rounded-xl bg-slate-950 p-3"><div className="text-xs text-slate-500">{label}</div><div className="font-data mt-1 text-xl font-bold">{value}</div></div>)}</div></div><div className="mt-6"><TeamPathExplanation {...explanation}/></div></div><aside className="card p-6"><p className="eyebrow">Model profile</p><h2 className="font-display mt-2 text-2xl font-bold">Baseline indicators</h2><div className="mt-6 space-y-5"><ProbabilityBar label="Relative attack" value={team.attack_rating/100}/><ProbabilityBar label="Relative defense" value={team.defense_rating/100}/><ProbabilityBar label="Rating strength" value={Math.min(1,(team.elo_rating-1400)/600)}/></div><h3 className="font-display mt-8 text-xl font-bold">Group fixtures</h3><ul className="mt-3 space-y-2 text-sm text-slate-300">{team.fixtures.map((fixture) => <li key={fixture.id} className="rounded-lg border border-[var(--border)] p-3">Matchday {fixture.matchday} · {fixture.home_team_id} vs {fixture.away_team_id}</li>)}</ul></aside></div>; }

