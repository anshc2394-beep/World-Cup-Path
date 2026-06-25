from __future__ import annotations

from .models import Team


def generate_team_explanation(team_id: str, tournament_state: dict, teams: list[Team] | None = None) -> dict:
    team_map = {team.id: team for team in (teams or [])}
    team = team_map.get(team_id)
    if not team:
        from .data import load_teams

        team = next((item for item in load_teams() if item.id == team_id), None)
    if not team:
        raise KeyError(f"Unknown team: {team_id}")
    status = tournament_state.get("qualification_status", {}).get(team_id, "unstarted")
    group_rows = tournament_state.get("standings", {}).get(team.group, [])
    row = next((item for item in group_rows if item["team_id"] == team_id), None)
    remaining = [
        f
        for f in tournament_state.get("fixtures", [])
        if team_id in (f["home_team_id"], f["away_team_id"]) and f["home_score"] is None
    ]
    key_match = remaining[0] if remaining else None
    if status == "confirmed":
        headline = f"{team.name} have qualified"
        summary = f"{team.name} are confirmed in the Round of 32 after finishing in a qualifying position in Group {team.group}."
        category = "already-qualified"
    elif status == "eliminated":
        headline = f"{team.name} are eliminated"
        summary = f"{team.name} finished outside the qualifying places in Group {team.group}."
        category = "likely-eliminated"
    elif status == "unstarted":
        headline = f"{team.name}'s path starts in Group {team.group}"
        summary = f"No scores have been entered yet. Wins and goal difference will shape {team.name}'s route to the Round of 32."
        category = "controls-own-path"
    else:
        position = row["position"] if row else 4
        category = "likely-to-qualify" if position <= 2 else "on-the-bubble"
        headline = f"{team.name} are currently {position}{'st' if position == 1 else 'nd' if position == 2 else 'rd' if position == 3 else 'th'} in Group {team.group}"
        goal_note = " Their goal difference is the next important separator." if row and position >= 3 else ""
        summary = f"The table is still provisional. Their next result can change both qualification status and the projected knockout path.{goal_note}"
    return {
        "team_id": team_id,
        "category": category,
        "headline": headline,
        "summary": summary,
        "key_match_id": key_match["id"] if key_match else None,
    }
