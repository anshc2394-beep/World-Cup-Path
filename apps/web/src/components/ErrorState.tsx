import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

export function ErrorState({
  title = "Something went wrong",
  message,
  action,
}: {
  title?: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div role="alert" className="card border-rose-400/45 bg-rose-950/25 p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-300/35 bg-rose-400/10 text-rose-200">
        <AlertTriangle aria-hidden="true" size={22} />
      </div>
      <h2 className="font-display mt-4 text-2xl font-bold text-rose-50">{title}</h2>
      <p className="mx-auto mt-2 max-w-md leading-7 text-rose-100/85">{message}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
