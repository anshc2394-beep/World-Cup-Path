from __future__ import annotations

from copy import deepcopy

import pytest
from worldcup_simulator import (
    BracketAllocationError,
    build_tournament_state,
    run_monte_carlo_simulations,
    validate_allocation_data,
)
from worldcup_simulator.bracket import load_allocation_data


def complete_scores(home: int = 1, away: int = 0):
    state = build_tournament_state()
    return [{"fixture_id": fixture["id"], "home_score": home, "away_score": away} for fixture in state["fixtures"]]


def test_blank_snapshot_has_48_teams_and_72_matches():
    state = build_tournament_state()
    assert state["progress"] == {"completed_group_matches": 0, "total_group_matches": 72, "bracket_unlocked": False}
    assert len(state["standings"]) == 12
    assert all(len(rows) == 4 for rows in state["standings"].values())
    assert all([row["position"] for row in rows] == [1, 2, 3, 4] for rows in state["standings"].values())


def test_points_goal_difference_and_third_place_qualification():
    state = build_tournament_state(scores=complete_scores())
    group_a = state["standings"]["A"]
    assert group_a[0]["points"] >= group_a[1]["points"]
    assert all(row["goal_difference"] == row["goals_for"] - row["goals_against"] for row in group_a)
    assert len(state["third_place"]) == 12
    assert sum(row["qualified"] for row in state["third_place"]) == 8
    assert len(state["qualified_team_ids"]) == 32
    assert len(state["bracket"]) == 32


def test_all_495_annex_c_allocations_validate_and_checksum():
    payload = load_allocation_data()
    assert len(payload["allocations"]) == 495
    validate_allocation_data(payload)
    broken = deepcopy(payload)
    broken["allocations"].pop(next(iter(broken["allocations"])))
    with pytest.raises(BracketAllocationError):
        validate_allocation_data(broken)


def test_monte_carlo_probabilities_are_bounded_monotonic_and_sum_to_one():
    result = run_monte_carlo_simulations(100, seed=2026)
    champion_total = 0.0
    for team in result["teams"]:
        values = [
            team["probability_qualify"],
            team["probability_round_of_16"],
            team["probability_quarterfinal"],
            team["probability_semifinal"],
            team["probability_final"],
            team["probability_champion"],
        ]
        assert all(0 <= value <= 1 for value in values)
        assert values == sorted(values, reverse=True)
        champion_total += team["probability_champion"]
    assert champion_total == pytest.approx(1.0)
