"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Gauge, Swords, Trophy } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Fixture, Team } from "@/lib/types";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";
import { ProbabilityBar } from "./ProbabilityBar";
import { TeamBadge } from "./TeamBadge";
import { TeamPathExplanation } from "./TeamPathExplanation";

type TeamDetail = Team & { fixtures: Fixture[] };
type TeamExplanation = { headline: string; summary: string };

function metricValue(label: string, value: number | string) {
  return { label, value };
}

function RatingCard({ label, value, accent }: { label: string; value: number | string; accent: "cyan" | "amber" | "emerald" }) {
  const accentClass =
    accent === "amber"
      ? "border-amber-300/25 bg-amber-300/10 text-amber-100"
      : accent === "emerald"
        ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
        : "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";

  return (
    <div className={`rounded-2xl border p-4 ${accentClass}`}>
      <div className="text-xs uppercase tracking-[0.14em] opacity-75">{label}</div>
      <div className="font-data mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}

function FixtureItem({ fixture, teamId }: { fixture: Fixture; teamId: string }) {
  const side = fixture.home_team_id === teamId ? "Home" : "Away";
  const opponentId = fixture.home_team_id === teamId ? fixture.away_team_id : fixture.home_team_id;

  return (
    <li className="rounded-2xl border border-[var(--border)] bg-slate-950/45 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-data text-xs uppercase tracking-[0.14em] text-slate-500">Matchday {fixture.matchday}</span>
        <span className="rounded-full border border-slate-700/70 px-2.5 py-1 text-xs font-bold text-slate-300">{side}</span>
      </div>
      <p className="mt-3 text-sm text-slate-300">
        <span className="font-bold text-white">{fixture.home_team_id}</span> vs <span className="font-bold text-white">{fixture.away_team_id}</span>
      </p>
      <p className="muted mt-1 text-xs">Opponent ID: {opponentId}</p>
    </li>
  );
}

export function TeamClient({ teamId }: { teamId: string }) {
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [explanation, setExplanation] = useState<TeamExplanation | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all([
      apiFetch<TeamDetail>(`/teams/${teamId}`),
      apiFetch<TeamExplanation>(`/teams/${teamId}/explanation`),
    ])
      .then(([teamData, explanationData]) => {
        if (!active) return;
        setTeam(teamData);
        setExplanation(explanationData);
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
  }, [teamId]);

  const ratingStrength = useMemo(() => {
    if (!team) return 0;
    return Math.min(1, Math.max(0, (team.elo_rating - 1400) / 600));
  }, [team]);

  if (!loaded) {
    return <LoadingState label="Loading team profile" body="Fetching fixtures, model ratings, and the deterministic path explanation." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Couldn’t load team profile"
        message={`${error} Check that the team ID is valid and that the FastAPI backend is running.`}
      />
    );
  }

  if (!team || !explanation) {
    return <EmptyState title="Team profile unavailable" body="The API returned no team details for this route. Try returning to the teams page and selecting another team." />;
  }

  const metrics = [
    metricValue("Elo", team.elo_rating),
    metricValue("Attack", team.attack_rating),
    metricValue("Defense", team.defense_rating),
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
      <div>
        <section className="card overflow-hidden p-6">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
            <div>
              <TeamBadge team={team} />
              <h1 className="font-display mt-5 text-5xl font-bold md:text-6xl">Group {team.group} contender</h1>
              <p className="muted mt-3 max-w-2xl leading-7">
                Baseline profile for the prediction model. Ratings are transparent inputs, not official FIFA rankings.
              </p>
            </div>
            <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">Group {team.group}</span>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {metrics.map((item, index) => (
              <RatingCard
                key={item.label}
                label={item.label}
                value={item.value}
                accent={index === 0 ? "cyan" : index === 1 ? "amber" : "emerald"}
              />
            ))}
          </div>
        </section>

        <div className="mt-6">
          <TeamPathExplanation {...explanation} />
        </div>
      </div>

      <aside className="space-y-6">
        <section className="card p-6">
          <div className="flex items-center gap-2 text-cyan-300">
            <Gauge aria-hidden="true" size={18} />
            <span className="eyebrow">Model profile</span>
          </div>
          <h2 className="font-display mt-2 text-2xl font-bold">Baseline indicators</h2>
          <p className="muted mt-2 text-sm leading-6">These bars normalize the starter ratings onto a readable 0–100% display scale.</p>
          <div className="mt-6 space-y-5">
            <ProbabilityBar label="Relative attack" value={team.attack_rating / 100} tone="amber" />
            <ProbabilityBar label="Relative defense" value={team.defense_rating / 100} tone="emerald" />
            <ProbabilityBar label="Rating strength" value={ratingStrength} tone="cyan" />
          </div>
        </section>

        <section className="card p-6">
          <div className="flex items-center gap-2 text-amber-300">
            <CalendarDays aria-hidden="true" size={18} />
            <span className="font-data text-xs font-bold uppercase tracking-[0.16em]">Group fixtures</span>
          </div>
          <h2 className="font-display mt-2 text-2xl font-bold">Opening path</h2>
          {team.fixtures.length ? (
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {team.fixtures.map((fixture) => (
                <FixtureItem key={fixture.id} fixture={fixture} teamId={team.id} />
              ))}
            </ul>
          ) : (
            <div className="mt-4">
              <EmptyState title="No fixtures found" body="This team loaded successfully, but the current snapshot did not return group fixtures." />
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-700/70 bg-slate-950/45 p-5">
          <div className="flex items-center gap-2 text-slate-300">
            <Swords aria-hidden="true" size={17} />
            <span className="font-data text-xs uppercase tracking-[0.14em] text-slate-500">What affects the path</span>
          </div>
          <p className="muted mt-3 text-sm leading-6">
            Group points, goal difference, the third-place cut line, and the generated Round-of-32 opponent all shape this team’s route.
          </p>
          <div className="mt-4 flex items-center gap-2 text-amber-200">
            <Trophy aria-hidden="true" size={16} />
            <span className="text-sm font-bold">Use the simulator for live scenario changes.</span>
          </div>
        </section>
      </aside>
    </div>
  );
}
