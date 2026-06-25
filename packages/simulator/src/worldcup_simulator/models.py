from __future__ import annotations

from dataclasses import asdict, dataclass


@dataclass(frozen=True, slots=True)
class Team:
    id: str
    name: str
    fifa_code: str
    group: str
    flag_emoji: str
    elo_rating: int
    attack_rating: int
    defense_rating: int

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass(slots=True)
class Fixture:
    id: str
    group: str
    matchday: int
    home_team_id: str
    away_team_id: str
    home_score: int | None = None
    away_score: int | None = None

    @property
    def completed(self) -> bool:
        return self.home_score is not None and self.away_score is not None

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass(slots=True)
class StandingRow:
    team_id: str
    team_name: str
    group: str
    played: int = 0
    wins: int = 0
    draws: int = 0
    losses: int = 0
    goals_for: int = 0
    goals_against: int = 0
    goal_difference: int = 0
    points: int = 0
    seed_rating: int = 0
    position: int = 0

    def to_dict(self) -> dict:
        return asdict(self)
