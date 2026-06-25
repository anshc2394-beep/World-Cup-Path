"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Team } from "@/lib/types";
import { LoadingState } from "./LoadingState";
import { TeamBadge } from "./TeamBadge";

export function TeamsClient() { const [teams, setTeams] = useState<Team[]>([]); const [query, setQuery] = useState(""); useEffect(() => { apiFetch<Team[]>("/teams").then(setTeams); }, []); const filtered = useMemo(() => teams.filter((team) => team.name.toLowerCase().includes(query.toLowerCase())), [teams, query]); if (!teams.length) return <LoadingState/>; return <><label className="mb-6 flex max-w-md items-center gap-2 rounded-xl border border-[var(--border)] bg-slate-950 px-4"><Search size={17}/><span className="sr-only">Search teams</span><input className="w-full bg-transparent py-3 outline-none" placeholder="Search 48 teams" value={query} onChange={(event) => setQuery(event.target.value)}/></label><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map((team) => <Link key={team.id} href={`/teams/${team.id}`} className="card cursor-pointer p-4 transition-colors hover:border-blue-500"><TeamBadge team={team}/><div className="mt-3 flex justify-between text-xs text-slate-400"><span>Group {team.group}</span><span className="font-data">Elo {team.elo_rating}</span></div></Link>)}</div></>; }

