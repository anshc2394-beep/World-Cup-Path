import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Bracket } from "./Bracket";
import { GroupTable } from "./GroupTable";
import { ProbabilityBar } from "./ProbabilityBar";
import { ScoreInput } from "./ScoreInput";
import type { StandingRow, Team } from "@/lib/types";

const team: Team = { id: "brazil", name: "Brazil", fifa_code: "BRA", group: "C", flag_emoji: "🇧🇷", elo_rating: 1900, attack_rating: 90, defense_rating: 88 };
const row: StandingRow = { team_id: "brazil", team_name: "Brazil", group: "C", position: 1, played: 3, wins: 2, draws: 1, losses: 0, goals_for: 6, goals_against: 2, goal_difference: 4, points: 7 };

describe("core simulator components", () => {
  it("accepts numeric score input", () => {
    const onChange = vi.fn();
    render(<ScoreInput label="Brazil score" value={null} onChange={onChange}/>);
    fireEvent.change(screen.getByLabelText("Brazil score"), { target: { value: "3" } });
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("renders full standings statistics", () => {
    render(<GroupTable group="C" rows={[row]} teams={{ brazil: team }}/>);
    expect(screen.getByRole("table", { name: "Group C standings" })).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("exposes probability as an accessible progress bar", () => {
    render(<ProbabilityBar label="Champion" value={0.245}/>);
    expect(screen.getByRole("progressbar", { name: "Champion" })).toHaveAttribute("aria-valuenow", "24.5");
  });

  it("keeps projected bracket choices locked", () => {
    const onWinner = vi.fn();
    render(<Bracket matches={[{ match_id: "73", round: "Round of 32", team_a_id: "brazil", team_b_id: null }]} teams={{ brazil: team }} unlocked={false} onWinner={onWinner}/>);
    expect(screen.getByRole("button", { name: /Brazil/ })).toBeDisabled();
  });
});

