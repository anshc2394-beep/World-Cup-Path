import { Route } from "lucide-react";
export function TeamPathExplanation({ headline, summary }: { headline: string; summary: string }) { return <section className="card p-6"><div className="flex items-center gap-2 text-cyan-300"><Route size={18}/><span className="eyebrow">Path explanation</span></div><h2 className="font-display mt-3 text-2xl font-bold">{headline}</h2><p className="muted mt-2 leading-7">{summary}</p></section>; }

