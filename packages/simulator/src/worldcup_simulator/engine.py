from __future__ import annotations

from copy import deepcopy

from .bracket import build_bracket
from .data import load_fixtures, load_teams
from .explanations import generate_team_explanation
from .standings import calculate_group_standings, get_qualified_teams


def build_tournament_state(
    snapshot_id: str = "official-pre-tournament",
    scores: list[dict] | None = None,
    knockout_winners: dict[str, str] | None = None,
    include_explanations: bool = False,
) -> dict:
    teams = load_teams()
    fixtures = load_fixtures(snapshot_id)
    score_map = {item["fixture_id"]: item for item in (scores or [])}
    for fixture in fixtures:
        if fixture.id in score_map:
            fixture.home_score = score_map[fixture.id].get("home_score")
            fixture.away_score = score_map[fixture.id].get("away_score")
    standings = calculate_group_standings(teams, fixtures)
    qualifiers, thirds = get_qualified_teams(standings)
    completed_count = sum(fixture.completed for fixture in fixtures)
    status = "unstarted" if completed_count == 0 else "confirmed" if completed_count == len(fixtures) else "projected"
    bracket = []
    if completed_count:
        bracket = build_bracket(standings, thirds, knockout_winners)
    qualified_set = set(qualifiers) if completed_count else set()
    third_payload = []
    for rank, row in enumerate(thirds, 1):
        item = row.to_dict()
        item.update({"rank": rank, "qualified": completed_count > 0 and rank <= 8, "status": status})
        third_payload.append(item)
    state = {
        "snapshot_id": snapshot_id,
        "progress": {
            "completed_group_matches": completed_count,
            "total_group_matches": len(fixtures),
            "bracket_unlocked": completed_count == len(fixtures),
        },
        "fixtures": [fixture.to_dict() for fixture in fixtures],
        "standings": {group: [row.to_dict() for row in rows] for group, rows in standings.items()},
        "third_place": third_payload,
        "qualified_team_ids": list(qualifiers) if completed_count else [],
        "qualification_status": {
            team.id: (status if team.id in qualified_set else "eliminated" if status == "confirmed" else status)
            for team in teams
        },
        "bracket": deepcopy(bracket),
        "champion_id": (knockout_winners or {}).get("104"),
    }
    if include_explanations:
        state["explanations"] = {team.id: generate_team_explanation(team.id, state, teams) for team in teams}
    return state
