from __future__ import annotations

import math
import secrets
from collections import defaultdict

import numpy as np

from .bracket import build_bracket
from .data import load_fixtures, load_teams
from .engine import build_tournament_state
from .models import Team
from .standings import calculate_group_standings, get_qualified_teams


def expected_goals(team_a: Team, team_b: Team) -> tuple[float, float]:
    def value(attacking: Team, defending: Team) -> float:
        elo_factor = math.exp((attacking.elo_rating - defending.elo_rating) / 900)
        attack_factor = attacking.attack_rating / 75
        defense_factor = 75 / defending.defense_rating
        return max(0.2, min(3.8, 1.28 * elo_factor * attack_factor * defense_factor))

    return value(team_a, team_b), value(team_b, team_a)


def _poisson_pmf(k: int, lam: float) -> float:
    return math.exp(-lam) * lam**k / math.factorial(k)


def predict_match(team_a: Team, team_b: Team) -> dict:
    lambda_a, lambda_b = expected_goals(team_a, team_b)
    outcomes = {"team_a_win": 0.0, "draw": 0.0, "team_b_win": 0.0}
    best = (0.0, 0, 0)
    for a in range(9):
        for b in range(9):
            probability = _poisson_pmf(a, lambda_a) * _poisson_pmf(b, lambda_b)
            key = "team_a_win" if a > b else "team_b_win" if b > a else "draw"
            outcomes[key] += probability
            if probability > best[0]:
                best = (probability, a, b)
    return {
        **outcomes,
        "expected_goals_a": lambda_a,
        "expected_goals_b": lambda_b,
        "most_likely_score": [best[1], best[2]],
    }


def simulate_score(team_a: Team, team_b: Team, rng: np.random.Generator | None = None) -> tuple[int, int]:
    rng = rng or np.random.default_rng()
    lambda_a, lambda_b = expected_goals(team_a, team_b)
    return int(rng.poisson(lambda_a)), int(rng.poisson(lambda_b))


def _knockout_result(team_a: Team, team_b: Team, rng: np.random.Generator) -> tuple[int, int, str, bool]:
    score_a, score_b = simulate_score(team_a, team_b, rng)
    penalties = False
    if score_a == score_b:
        penalties = True
        chance_a = 1 / (1 + 10 ** ((team_b.elo_rating - team_a.elo_rating) / 600))
        winner = team_a.id if rng.random() < chance_a else team_b.id
    else:
        winner = team_a.id if score_a > score_b else team_b.id
    return score_a, score_b, winner, penalties


def simulate_group_stage(groups=None, fixtures=None, seed: int | None = None) -> list[dict]:
    teams = load_teams()
    fixtures = fixtures or load_fixtures()
    team_map = {team.id: team for team in teams}
    rng = np.random.default_rng(seed)
    results = []
    for fixture in fixtures:
        home, away = simulate_score(team_map[fixture.home_team_id], team_map[fixture.away_team_id], rng)
        results.append({"fixture_id": fixture.id, "home_score": home, "away_score": away})
    return results


def simulate_knockout(bracket: list[dict], teams: list[Team] | None = None, seed: int | None = None) -> dict:
    team_map = {team.id: team for team in (teams or load_teams())}
    rng = np.random.default_rng(seed)
    winners = {}
    results = []
    for match in bracket:
        if not match.get("team_a_id") or not match.get("team_b_id"):
            continue
        a, b, winner, penalties = _knockout_result(team_map[match["team_a_id"]], team_map[match["team_b_id"]], rng)
        winners[match["match_id"]] = winner
        results.append(
            {
                "match_id": match["match_id"],
                "team_a_score": a,
                "team_b_score": b,
                "winner_id": winner,
                "decided_by_penalties": penalties,
            }
        )
    return {"winners": winners, "results": results}


def simulate_tournament(snapshot_id: str = "official-pre-tournament", seed: int | None = None) -> dict:
    effective_seed = seed if seed is not None else secrets.randbits(32)
    rng = np.random.default_rng(effective_seed)
    teams = load_teams()
    team_map = {team.id: team for team in teams}
    fixtures = load_fixtures(snapshot_id)
    scores = []
    for fixture in fixtures:
        home, away = simulate_score(team_map[fixture.home_team_id], team_map[fixture.away_team_id], rng)
        fixture.home_score, fixture.away_score = home, away
        scores.append({"fixture_id": fixture.id, "home_score": home, "away_score": away})
    standings = calculate_group_standings(teams, fixtures)
    _, thirds = get_qualified_teams(standings)
    winners: dict[str, str] = {}
    knockout_results = []
    for match_id in range(73, 105):
        bracket = build_bracket(standings, thirds, winners)
        match = next(item for item in bracket if item["match_id"] == str(match_id))
        if not match.get("team_a_id") or not match.get("team_b_id"):
            raise RuntimeError(f"Bracket progression failed to populate match {match_id}")
        a, b, winner, penalties = _knockout_result(team_map[match["team_a_id"]], team_map[match["team_b_id"]], rng)
        winners[str(match_id)] = winner
        knockout_results.append(
            {
                "match_id": str(match_id),
                "team_a_score": a,
                "team_b_score": b,
                "winner_id": winner,
                "decided_by_penalties": penalties,
            }
        )
    state = build_tournament_state(snapshot_id, scores, winners)
    state.update(
        {
            "seed": effective_seed,
            "group_scores": scores,
            "knockout_winners": winners,
            "knockout_results": knockout_results,
        }
    )
    return state


def run_monte_carlo_simulations(n: int, snapshot_id: str = "official-pre-tournament", seed: int | None = None) -> dict:
    if not 100 <= n <= 10_000:
        raise ValueError("runs must be between 100 and 10000")
    effective_seed = seed if seed is not None else secrets.randbits(32)
    master_rng = np.random.default_rng(effective_seed)
    teams = load_teams()
    counts = {team.id: defaultdict(int) for team in teams}
    for _ in range(n):
        result = simulate_tournament(snapshot_id, int(master_rng.integers(0, 2**32 - 1)))
        for group_rows in result["standings"].values():
            counts[group_rows[0]["team_id"]]["win_group"] += 1
        for team_id in result["qualified_team_ids"]:
            counts[team_id]["qualify"] += 1
        winners = result["knockout_winners"]
        for match_id, key in (
            (range(73, 89), "round_of_16"),
            (range(89, 97), "quarterfinal"),
            (range(97, 101), "semifinal"),
            (range(101, 103), "final"),
        ):
            for item in match_id:
                counts[winners[str(item)]][key] += 1
        counts[winners["104"]]["champion"] += 1
    payload = []
    for team in teams:
        item = {"team_id": team.id, "team_name": team.name, "group": team.group}
        for key in ("win_group", "qualify", "round_of_16", "quarterfinal", "semifinal", "final", "champion"):
            item[f"probability_{key}"] = counts[team.id][key] / n
        payload.append(item)
    payload.sort(key=lambda item: (-item["probability_champion"], item["team_name"]))
    return {"runs": n, "seed": effective_seed, "teams": payload}
