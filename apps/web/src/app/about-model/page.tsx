import Link from "next/link";
import { ArrowRight } from "lucide-react";
const sections=[
  ["1 · Ratings", "Each team starts with an illustrative Elo rating plus attack and defense scores. They are transparent model inputs, not official FIFA ratings."],
  ["2 · Expected goals", "The model converts Elo difference and attack-versus-defense strength into neutral-site expected goals, with conservative bounds for stability."],
  ["3 · Poisson scorelines", "Independent Poisson draws produce realistic match scores. Knockout draws use a seeded, rating-weighted penalty decision so every tie has a winner."],
  ["4 · Monte Carlo", "Thousands of complete tournaments are replayed to estimate group wins, qualification, stage reach, and championship probability."],
];
export default function AboutModel(){return <div className="shell py-12"><p className="eyebrow">Transparent by design</p><h1 className="font-display mt-2 max-w-3xl text-6xl font-bold">A model you can understand, challenge, and improve.</h1><p className="muted mt-5 max-w-2xl text-lg leading-8">WorldCupPath uses no hidden AI service. Every score and explanation comes from documented ratings, tournament rules, and deterministic templates.</p><div className="mt-10 grid gap-4 md:grid-cols-2">{sections.map(([title,body])=><article key={title} className="card p-6"><h2 className="font-display text-2xl font-bold">{title}</h2><p className="muted mt-3 leading-7">{body}</p></article>)}</div><div className="card mt-6 p-6"><h2 className="font-display text-2xl font-bold">Known limitations</h2><p className="muted mt-3 leading-7">The first release does not model injuries, lineups, venue travel, live form, or the complete FIFA fair-play tiebreak chain. Ratings are illustrative and probabilities are simulations, not guarantees.</p><Link href="/simulations" className="button button-primary mt-5">Open simulation lab <ArrowRight size={16}/></Link></div></div>;}

