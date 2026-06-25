import { TeamsClient } from "@/components/TeamsClient";

export default function TeamsPage() {
  return (
    <div className="shell py-10">
      <p className="eyebrow">48 nations</p>
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="font-display mt-2 text-5xl font-bold md:text-6xl">Team paths and ratings</h1>
          <p className="muted mt-3 max-w-2xl leading-7">
            Search the starter field, compare transparent model inputs, and open team pages for fixtures and path explanations.
          </p>
        </div>
        <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
          Official pre-tournament snapshot
        </span>
      </div>
      <TeamsClient />
    </div>
  );
}
