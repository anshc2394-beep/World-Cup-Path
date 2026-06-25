from __future__ import annotations

from collections import defaultdict
from dataclasses import replace

from .models import Fixture, StandingRow, Team


def rank_group(rows: list[StandingRow]) -> list[StandingRow]:
    # TODO: add official head-to-head, team conduct/fair-play and drawing-of-lots rules.
    ranked = sorted(
        rows,
        key=lambda row: (-row.points, -row.goal_difference, -row.goals_for, -row.wins, -row.seed_rating, row.team_name),
    )
    for position, row in enumerate(ranked, 1):
        row.position = position
    return ranked


def calculate_group_standings(teams: list[Team], fixtures: list[Fixture]) -> dict[str, list[StandingRow]]:
    rows = {
        team.id: StandingRow(team_id=team.id, team_name=team.name, group=team.group, seed_rating=team.elo_rating)
        for team in teams
    }
    for fixture in fixtures:
        if not fixture.completed:
            continue
        home = rows[fixture.home_team_id]
        away = rows[fixture.away_team_id]
        home.played += 1
        away.played += 1
        home.goals_for += fixture.home_score or 0
        home.goals_against += fixture.away_score or 0
        away.goals_for += fixture.away_score or 0
        away.goals_against += fixture.home_score or 0
        if fixture.home_score > fixture.away_score:
            home.wins += 1
            home.points += 3
            away.losses += 1
        elif fixture.home_score < fixture.away_score:
            away.wins += 1
            away.points += 3
            home.losses += 1
        else:
            home.draws += 1
            away.draws += 1
            home.points += 1
            away.points += 1
    grouped: dict[str, list[StandingRow]] = defaultdict(list)
    for row in rows.values():
        row.goal_difference = row.goals_for - row.goals_against
        grouped[row.group].append(row)
    return {group: rank_group(group_rows) for group, group_rows in sorted(grouped.items())}


def rank_third_place_teams(groups: dict[str, list[StandingRow]]) -> list[StandingRow]:
    # Rank copies so the cross-group table never overwrites group positions.
    thirds = [replace(rows[2]) for rows in groups.values()]
    return rank_group(thirds)


def get_qualified_teams(groups: dict[str, list[StandingRow]]) -> tuple[list[str], list[StandingRow]]:
    thirds = rank_third_place_teams(groups)
    qualifiers = [row.team_id for rows in groups.values() for row in rows[:2]]
    qualifiers.extend(row.team_id for row in thirds[:8])
    return qualifiers, thirds
