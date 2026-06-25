import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, BarChart3, Brackets, Gauge, ListChecks, Route, ShieldAlert, Sigma, Trophy } from "lucide-react";

type ModelSection = {
  icon: LucideIcon;
  title: string;
  body: string;
};

const modelSections: ModelSection[] = [
  {
    icon: Gauge,
    title: "Transparent ratings",
    body: "Each team starts with an illustrative Elo rating plus attack and defense scores. These are model inputs, not official FIFA ratings or betting lines.",
  },
  {
    icon: Sigma,
    title: "Expected goals",
    body: "The engine converts strength differences into expected goals, then keeps those values within conservative bounds so simulations remain stable.",
  },
  {
    icon: Route,
    title: "Poisson scorelines",
    body: "Group matches use Poisson-style score draws. Knockout draws are resolved with a simple seeded penalty decision so every knockout match has a winner.",
  },
  {
    icon: BarChart3,
    title: "Monte Carlo probabilities",
    body: "Seeded tournament runs estimate stage reach, finalist odds, and championship probability. Results are reproducible locally for the same run settings.",
  },
];

const formatSections: ModelSection[] = [
  {
    icon: ListChecks,
    title: "Group stage",
    body: "The simulator calculates standings from predicted scores across 12 groups of 4 teams using points, goal difference, goals scored, wins, and deterministic fallback sorting.",
  },
  {
    icon: Trophy,
    title: "Third-place ranking",
    body: "The 12 third-place teams are ranked separately. The top 8 join the 24 automatic qualifiers to create the 32-team knockout field.",
  },
  {
    icon: Brackets,
    title: "Knockout bracket",
    body: "Qualified teams feed into the Round of 32 structure, then progress through Round of 16, Quarterfinals, Semifinals, Third-place match, Final, and Champion.",
  },
];

const limitations = [
  "No injuries, lineups, travel fatigue, or tactical form are modeled.",
  "Ratings are starter data for an educational simulator, not official power rankings.",
  "Probabilities describe simulated outcomes, not guarantees.",
  "Official fair-play and drawing-of-lots edge cases are documented simplifications.",
];

function ExplanationCard({ section }: { section: ModelSection }) {
  const Icon = section.icon;

  return (
    <article className="card p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
        <Icon aria-hidden="true" size={21} />
      </div>
      <h2 className="font-display mt-5 text-2xl font-bold">{section.title}</h2>
      <p className="muted mt-3 leading-7">{section.body}</p>
    </article>
  );
}

export default function AboutModel() {
  return (
    <div className="shell py-12">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
        <div>
          <p className="eyebrow">Transparent by design</p>
          <h1 className="font-display mt-2 max-w-4xl text-5xl font-bold md:text-7xl">
            A model you can understand, challenge, and improve.
          </h1>
          <p className="muted mt-5 max-w-2xl text-lg leading-8">
            WorldCupPath uses documented tournament rules, starter ratings, deterministic explanations, and seeded simulations. No hidden AI service is needed
            for the first release.
          </p>
        </div>
        <div className="card p-5">
          <p className="font-data text-xs uppercase tracking-[0.16em] text-slate-500">Model promise</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {["Readable inputs", "Reproducible runs", "Honest limits"].map((item) => (
              <div key={item} className="rounded-2xl border border-[var(--border)] bg-slate-950/45 p-4 font-bold text-slate-100">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="model-core-title">
        <div className="mb-5">
          <p className="eyebrow">Prediction model</p>
          <h2 id="model-core-title" className="font-display mt-2 text-4xl font-bold">
            How probabilities are produced
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {modelSections.map((section) => (
            <ExplanationCard key={section.title} section={section} />
          ))}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="format-title">
        <div className="mb-5">
          <p className="eyebrow">2026 format</p>
          <h2 id="format-title" className="font-display mt-2 text-4xl font-bold">
            The simulator follows the expanded tournament flow
          </h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {formatSections.map((section) => (
            <ExplanationCard key={section.title} section={section} />
          ))}
        </div>
      </section>

      <section className="card mt-10 p-6" aria-labelledby="limitations-title">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-300/10 text-amber-200">
            <ShieldAlert aria-hidden="true" size={22} />
          </div>
          <div>
            <p className="eyebrow">Known limitations</p>
            <h2 id="limitations-title" className="font-display mt-2 text-3xl font-bold">
              Credible simulation, not a crystal ball
            </h2>
            <p className="muted mt-2 max-w-3xl leading-7">
              This is an unofficial fan-made educational simulator. It is designed to be understandable and extensible, not to forecast the tournament perfectly.
            </p>
          </div>
        </div>
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {limitations.map((item) => (
            <li key={item} className="rounded-2xl border border-[var(--border)] bg-slate-950/45 p-4 text-sm leading-6 text-slate-300">
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/simulations" className="button button-primary">
            Open Simulation Lab
            <ArrowRight aria-hidden="true" size={16} />
          </Link>
          <Link href="/simulator" className="button button-secondary">
            Start Simulator
            <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
