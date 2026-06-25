from __future__ import annotations

from pydantic import BaseModel, Field, model_validator


class ScoreInput(BaseModel):
    fixture_id: str
    home_score: int | None = Field(default=None, ge=0, le=20)
    away_score: int | None = Field(default=None, ge=0, le=20)

    @model_validator(mode="after")
    def scores_are_paired(self):
        if (self.home_score is None) != (self.away_score is None):
            raise ValueError("home_score and away_score must both be supplied or both be null")
        return self


class TournamentStateInput(BaseModel):
    snapshot_id: str = "official-pre-tournament"
    scores: list[ScoreInput] = []
    knockout_winners: dict[str, str] = {}


class MatchSimulationInput(BaseModel):
    team_a_id: str
    team_b_id: str
    seed: int | None = None
