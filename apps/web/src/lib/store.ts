"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Score } from "./types";

type SimulatorStore = {
  snapshotId: string;
  scores: Record<string, Score>;
  winners: Record<string, string>;
  setSnapshot: (id: string) => void;
  setScore: (fixtureId: string, side: "home_score" | "away_score", value: number | null) => void;
  setWinner: (matchId: string, teamId: string) => void;
  load: (scores: Score[], winners?: Record<string, string>, snapshotId?: string) => void;
  reset: () => void;
};

export const useSimulatorStore = create<SimulatorStore>()(persist((set) => ({
  snapshotId: "official-pre-tournament",
  scores: {},
  winners: {},
  setSnapshot: (snapshotId) => set({ snapshotId, scores: {}, winners: {} }),
  setScore: (fixtureId, side, value) => set((state) => ({ scores: { ...state.scores, [fixtureId]: { fixture_id: fixtureId, home_score: state.scores[fixtureId]?.home_score ?? null, away_score: state.scores[fixtureId]?.away_score ?? null, [side]: value } } })),
  setWinner: (matchId, teamId) => set((state) => ({ winners: { ...state.winners, [matchId]: teamId } })),
  load: (scores, winners = {}, snapshotId = "official-pre-tournament") => set({ scores: Object.fromEntries(scores.map((score) => [score.fixture_id, score])), winners, snapshotId }),
  reset: () => set({ snapshotId: "official-pre-tournament", scores: {}, winners: {} }),
}), { name: "worldcup-path-state-v1", version: 1 }));

