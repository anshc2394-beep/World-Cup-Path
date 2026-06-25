import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brackets,
  Gauge,
  ListChecks,
  Play,
  Route,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

type HomeCta = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  primary?: boolean;
};

type StoryCard = {
  icon: LucideIcon;
  title: string;
  body: string;
};

const primaryCtas: HomeCta[] = [
  {
    href: "/simulator",
    label: "Start Simulator",
    description: "Enter scores and build a full tournament path.",
    icon: Play,
    primary: true,
  },
  {
    href: "/groups",
    label: "View Groups",
    description: "Explore all 12 groups and blank-score fixtures.",
    icon: Users,
  },
  {
    href: "/simulations",
    label: "Run Monte Carlo",
    description: "Compare stage and championship probabilities.",
    icon: BarChart3,
  },
  {
    href: "/teams",
    label: "View Teams",
    description: "Inspect ratings, fixtures, paths, and status.",
    icon: ShieldCheck,
  },
  {
    href: "/about-model",
    label: "Read Model Explanation",
    description: "See how expected goals and simulations work.",
    icon: BookOpen,
  },
];

const formatStats = [
  ["48", "teams"],
  ["12", "groups"],
  ["72", "group matches"],
  ["32", "knockout teams"],
  ["8", "third-place qualifiers"],
];

const storyCards: StoryCard[] = [
  {
    icon: ListChecks,
    title: "Group Stage Control",
    body: "Edit predictions across all 72 group matches and watch tables update using points, goal difference, goals scored, and deterministic tiebreakers.",
  },
  {
    icon: Route,
    title: "Third-place Race",
    body: "Rank every third-place team in one cut-line table so the expanded format stays understandable without spreadsheet hunting.",
  },
  {
    icon: Brackets,
    title: "Round-of-32 Bracket",
    body: "Generate the knockout path from the official 2026 structure, then advance winners through the Final and champion endpoint.",
  },
  {
    icon: Gauge,
    title: "Monte Carlo Lab",
    body: "Run seeded simulations to compare qualification, knockout survival, finalist odds, and championship probability.",
  },
];

const previewRows = [
  ["Group board", "A–L", "12 groups, 4 teams each"],
  ["Qualification", "Top 2 + 8", "Automatic spots plus the third-place cut line"],
  ["Bracket", "73–104", "Round of 32 through Final and Third-place match"],
  ["Model", "Seeded", "Repeatable Poisson-style tournament simulations"],
];

const previewBars = [
  ["Qualify", "Illustrative high", "w-[82%]", "from-emerald-500 to-lime-300"],
  ["Reach Final", "Illustrative medium", "w-[46%]", "from-blue-500 to-cyan-300"],
  ["Champion", "Illustrative narrow", "w-[24%]", "from-amber-500 to-yellow-300"],
];

function CtaCard({ cta }: { cta: HomeCta }) {
  const Icon = cta.icon;

  return (
    <Link
      href={cta.href}
      className={`group rounded-2xl border p-4 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
        cta.primary
          ? "border-amber-300/45 bg-amber-300/12 text-white hover:border-amber-200 hover:bg-amber-300/18"
          : "border-[var(--border)] bg-slate-950/45 text-slate-100 hover:border-cyan-300/45 hover:bg-cyan-300/10"
      }`}
    >
      <span className="flex items-center justify-between gap-4">
        <span className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
              cta.primary ? "border-amber-300/35 bg-amber-300/15 text-amber-200" : "border-cyan-300/25 bg-cyan-300/10 text-cyan-200"
            }`}
          >
            <Icon aria-hidden="true" size={19} />
          </span>
          <span className="min-w-0">
            <span className="block font-bold">{cta.label}</span>
            <span className="mt-1 block text-sm leading-6 text-slate-400">{cta.description}</span>
          </span>
        </span>
        <ArrowRight aria-hidden="true" className="shrink-0 text-slate-500 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-cyan-200" size={18} />
      </span>
    </Link>
  );
}

function ControlRoomPreview() {
  return (
    <aside className="card relative overflow-hidden p-5 md:p-6" aria-label="Illustrative dashboard preview">
      <div aria-hidden="true" className="absolute right-[-5rem] top-[-5rem] h-56 w-56 rounded-full bg-cyan-400/18 blur-3xl" />
      <div aria-hidden="true" className="absolute bottom-[-4rem] left-[-4rem] h-44 w-44 rounded-full bg-amber-300/12 blur-3xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Control-room preview</p>
            <h2 className="font-display mt-2 text-3xl font-bold">One prediction changes every path.</h2>
          </div>
          <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">Illustrative</span>
        </div>

        <div className="mt-6 grid gap-3">
          {previewRows.map(([label, value, detail]) => (
            <div key={label} className="rounded-2xl border border-[var(--border)] bg-[#071523]/85 p-4">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm font-bold text-slate-200">{label}</span>
                <span className="font-data text-lg font-bold text-cyan-200">{value}</span>
              </div>
              <p className="muted mt-1 text-sm leading-6">{detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-amber-300/25 bg-amber-300/[0.07] p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="font-data text-xs uppercase tracking-[0.16em] text-amber-200">Model output preview</span>
            <Sparkles aria-hidden="true" size={17} className="text-amber-300" />
          </div>
          <div className="space-y-3">
            {previewBars.map(([label, value, width, gradient]) => (
              <div key={label}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-200">{label}</span>
                  <span className="font-data text-[11px] uppercase tracking-[0.08em] text-slate-400">{value}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-950 ring-1 ring-slate-700/80">
                  <div className={`h-full rounded-full bg-gradient-to-r ${gradient} ${width}`} />
                </div>
              </div>
            ))}
          </div>
          <p className="muted mt-4 text-xs leading-5">Preview bars are illustrative UI samples, not live calculated results.</p>
        </div>
      </div>
    </aside>
  );
}

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
      <div className="font-data text-2xl font-bold text-white">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">{label}</div>
    </div>
  );
}

function StoryCard({ card }: { card: StoryCard }) {
  const Icon = card.icon;

  return (
    <article className="card p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
        <Icon aria-hidden="true" size={21} />
      </div>
      <h3 className="font-display mt-5 text-2xl font-bold">{card.title}</h3>
      <p className="muted mt-2 leading-7">{card.body}</p>
    </article>
  );
}

function BracketPreview() {
  return (
    <div className="card p-5 md:p-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Product flow</p>
          <h2 className="font-display mt-2 text-3xl font-bold">From blank scores to trophy path</h2>
        </div>
        <Link href="/simulator" className="button button-secondary">
          Open Simulator
          <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {["Groups", "Third-place", "Round of 32", "Champion"].map((step, index) => (
          <div key={step} className="rounded-2xl border border-[var(--border)] bg-slate-950/45 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="font-data text-xs uppercase tracking-[0.16em] text-slate-500">Step {index + 1}</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 text-xs font-bold text-cyan-100">{index + 1}</span>
            </div>
            <h3 className="font-display text-2xl font-bold">{step}</h3>
            <p className="muted mt-2 text-sm leading-6">
              {index === 0
                ? "Edit the group-stage fixture grid."
                : index === 1
                  ? "Rank the 12 third-place teams."
                  : index === 2
                    ? "Generate and advance the bracket."
                    : "Close the story with Match 104."}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <section className="shell grid min-h-[78vh] items-center gap-10 py-14 lg:grid-cols-[1.05fr_.95fr] lg:py-20" aria-labelledby="home-hero-title">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-cyan-100">
            <Trophy aria-hidden="true" size={15} />
            2026 Tournament Control Room
          </div>
          <h1 id="home-hero-title" className="font-display mt-5 max-w-5xl text-6xl font-bold leading-[0.9] tracking-tight text-balance md:text-8xl">
            Predict the expanded <span className="text-cyan-300">World Cup path.</span>
          </h1>
          <p className="muted mt-6 max-w-2xl text-lg leading-8">
            WorldCupPath 2026 is a full-stack tournament simulator for the 48-team men’s World Cup format. Edit scores, track the third-place cut line,
            generate the knockout bracket, run Monte Carlo simulations, and explain each team’s route in plain English.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {primaryCtas.map((cta) => (
              <CtaCard key={cta.href} cta={cta} />
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <ShieldCheck aria-hidden="true" size={16} color="var(--success)" />
              Official pre-tournament snapshot, blank scores
            </span>
            <span className="flex items-center gap-2">
              <Brackets aria-hidden="true" size={16} color="var(--amber)" />
              Round-of-32 through champion
            </span>
          </div>
        </div>

        <ControlRoomPreview />
      </section>

      <section className="shell pb-8" aria-label="2026 World Cup format summary">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {formatStats.map(([value, label]) => (
            <StatPill key={label} value={value} label={label} />
          ))}
        </div>
      </section>

      <section className="shell py-10" aria-labelledby="story-title">
        <div className="mb-6 max-w-3xl">
          <p className="eyebrow">What the app does</p>
          <h2 id="story-title" className="font-display mt-2 text-4xl font-bold md:text-5xl">
            A portfolio-grade simulator, not a static bracket.
          </h2>
          <p className="muted mt-3 leading-7">
            The landing page previews the workflow only. Real standings, bracket paths, and probabilities are calculated inside the simulator and API.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {storyCards.map((card) => (
            <StoryCard key={card.title} card={card} />
          ))}
        </div>
      </section>

      <section className="shell py-10">
        <BracketPreview />
      </section>

      <section className="shell pb-16 pt-6">
        <div className="card overflow-hidden p-6 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="eyebrow">Ready to build a scenario?</p>
              <h2 className="font-display mt-2 text-4xl font-bold">Start with blank official fixtures, then make the tournament yours.</h2>
              <p className="muted mt-3 max-w-2xl leading-7">
                Keep it simple with score predictions, or go deeper with simulation odds, saved predictions, and team-by-team path explanations.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="/simulator" className="button button-primary">
                Start Simulator
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
              <Link href="/about-model" className="button button-secondary">
                Read Model Explanation
                <BookOpen aria-hidden="true" size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
