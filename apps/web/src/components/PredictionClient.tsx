"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useSimulatorStore } from "@/lib/store";
import type { Score, TournamentState } from "@/lib/types";
import { LoadingState } from "./LoadingState";

export function PredictionClient({ predictionId }: { predictionId: string }) { const router=useRouter(); const load=useSimulatorStore((s)=>s.load); const [data,setData]=useState<{id:string;created_at:string;state:{snapshot_id:string;scores:Score[];knockout_winners:Record<string,string>};derived_state:TournamentState}|null>(null); useEffect(()=>{apiFetch<typeof data>(`/predictions/${predictionId}`).then(setData);},[predictionId]); if(!data)return <LoadingState/>; return <div className="card p-6 md:p-8"><p className="eyebrow">Shared immutable prediction</p><h1 className="font-display mt-2 text-4xl font-bold">Prediction {data.id}</h1><p className="muted mt-2">Saved {new Date(data.created_at).toLocaleString()} · {data.derived_state.progress.completed_group_matches}/72 group matches complete</p>{data.derived_state.champion_id && <div className="mt-6 rounded-xl border border-amber-400/40 bg-amber-400/10 p-5"><span className="text-sm text-amber-200">Predicted champion</span><div className="font-display mt-1 text-3xl font-bold">{data.derived_state.champion_id}</div></div>}<button className="button button-primary mt-6" onClick={()=>{load(data.state.scores,data.state.knockout_winners,data.state.snapshot_id);router.push('/simulator');}}><Copy size={16}/> Remix this prediction</button></div>; }

