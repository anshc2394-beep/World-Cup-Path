export function ScenarioCard({ title, body }: { title: string; body: string }) { return <article className="card p-5"><p className="eyebrow">Scenario</p><h3 className="font-display mt-2 text-xl font-bold">{title}</h3><p className="muted mt-2 text-sm leading-6">{body}</p></article>; }

