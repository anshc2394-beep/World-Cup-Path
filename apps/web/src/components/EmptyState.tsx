import type { ReactNode } from "react";
import { SearchX } from "lucide-react";

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="card p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-600/60 bg-slate-950/60 text-slate-300">
        <SearchX aria-hidden="true" size={22} />
      </div>
      <h3 className="font-display mt-4 text-2xl font-bold">{title}</h3>
      <p className="muted mx-auto mt-2 max-w-md leading-7">{body}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
