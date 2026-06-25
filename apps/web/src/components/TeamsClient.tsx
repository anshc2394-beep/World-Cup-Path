"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search, ShieldCheck, SlidersHorizontal, Users } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Team } from "@/lib/types";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";
import { TeamBadge } from "./TeamBadge";

function groupSummary(teams: Team[]) {
  return teams.reduce<Record<string, number>>((summary, team) => {
    summary[team.group] = (summary[team.group] ?? 0) + 1;
    return summary;
  }, {});
}

function TeamCard({ team }: { team: Team }) {
  return (
    <Link
      href={`/teams/${team.id}`}
      className="card group block cursor-pointer p-4 transition-colors duration-200 hover:border-cyan-300/50 hover:bg-slate-900/70 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
    >
      <div className="flex items-start justify-between gap-3">
        <TeamBadge team={team} />
        <span className="shrink-0 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1 text-xs font-bold text-cyan-100">Group {team.group}</span>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-slate-950/70 p-2">
          <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Elo</div>
          <div className="font-data mt-1 text-sm font-bold text-slate-100">{team.elo_rating}</div>
        </div>
        <div className="rounded-xl bg-slate-950/70 p-2">
          <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500">ATK</div>
          <div className="font-data mt-1 text-sm font-bold text-slate-100">{team.attack_rating}</div>
        </div>
        <div className="rounded-xl bg-slate-950/70 p-2">
          <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500">DEF</div>
          <div className="font-data mt-1 text-sm font-bold text-slate-100">{team.defense_rating}</div>
        </div>
      </div>
      <p className="muted mt-4 text-sm leading-6">Open team profile, fixtures, baseline ratings, and path explanation.</p>
    </Link>
  );
}

export function TeamsClient() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    apiFetch<Team[]>("/teams")
      .then((teamData) => {
        if (!active) return;
        setTeams(teamData);
        setError("");
      })
      .catch((reason: Error) => {
        if (!active) return;
        setError(reason.message);
      })
      .finally(() => {
        if (active) setLoaded(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return teams;

    return teams.filter((team) =>
      [team.name, team.fifa_code, `Group ${team.group}`, team.group].some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [teams, query]);
  const groups = useMemo(() => groupSummary(teams), [teams]);

  if (!loaded) {
    return <LoadingState label="Loading teams" body="Fetching the 48-team catalog, ratings, groups, and team identifiers." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Couldn’t load teams"
        message={`${error} Check that the FastAPI backend is running, then refresh this page.`}
      />
    );
  }

  return (
    <>
      <section className="card p-4 md:p-5" aria-labelledby="teams-browser-title">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow">Team browser</p>
            <h2 id="teams-browser-title" className="font-display mt-2 text-3xl font-bold">
              Search nations, groups, and ratings
            </h2>
            <p className="muted mt-2 max-w-2xl leading-7">Browse every starter team in the official pre-tournament snapshot.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-3">
              <div className="flex items-center gap-2 text-cyan-100">
                <Users aria-hidden="true" size={16} />
                <span className="font-data text-xl font-bold">{teams.length}</span>
              </div>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-cyan-100/70">Teams loaded</p>
            </div>
            <div className="rounded-2xl border border-amber-300/25 bg-amber-300/10 px-4 py-3">
              <div className="flex items-center gap-2 text-amber-100">
                <ShieldCheck aria-hidden="true" size={16} />
                <span className="font-data text-xl font-bold">{Object.keys(groups).length}</span>
              </div>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-amber-100/70">Groups covered</p>
            </div>
          </div>
        </div>

        <label
          htmlFor="team-search"
          className="mt-5 flex max-w-2xl items-center gap-3 rounded-2xl border border-[var(--border)] bg-slate-950/80 px-4 transition-colors duration-200 focus-within:border-cyan-300/70 focus-within:ring-2 focus-within:ring-cyan-300 focus-within:ring-offset-2 focus-within:ring-offset-slate-950"
        >
          <Search aria-hidden="true" className="shrink-0 text-slate-500" size={18} />
          <span className="sr-only">Search teams</span>
          <input
            id="team-search"
            name="team-search"
            type="search"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent py-3 text-slate-100 outline-none placeholder:text-slate-500"
            placeholder="Search Brazil, USA, Group A…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <SlidersHorizontal aria-hidden="true" className="hidden shrink-0 text-slate-600 sm:block" size={17} />
        </label>
      </section>

      <div className="mt-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <p className="text-sm text-slate-400">
          Showing <span className="font-data font-bold text-slate-100">{filtered.length}</span> of{" "}
          <span className="font-data font-bold text-slate-100">{teams.length}</span> teams
        </p>
        {query ? <p className="font-data text-xs uppercase tracking-[0.14em] text-cyan-200">Filtered by “{query}”</p> : null}
      </div>

      {filtered.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState
            title="No teams match that search"
            body="Try a country name, FIFA code, or group letter. The default snapshot includes all 48 teams."
            action={
              <button type="button" className="button button-secondary" onClick={() => setQuery("")}>
                Clear Search
              </button>
            }
          />
        </div>
      )}
    </>
  );
}
