from __future__ import annotations

import json
from copy import deepcopy
from functools import lru_cache
from pathlib import Path

from .models import Fixture, Team


def data_root() -> Path:
    return Path(__file__).resolve().parents[3] / "data"


@lru_cache(maxsize=None)
def _read(name: str):
    return json.loads((data_root() / name).read_text(encoding="utf-8"))


def load_manifest() -> dict:
    return _read("manifest.json")


def load_snapshots() -> list[dict]:
    return _read("snapshots.json")


def load_teams() -> list[Team]:
    return [Team(**item) for item in _read("teams.json")]


def load_groups() -> list[dict]:
    return _read("groups.json")


def load_fixtures(snapshot_id: str = "official-pre-tournament") -> list[Fixture]:
    fixtures = deepcopy(_read("fixtures.json"))
    snapshots = {item["id"]: item for item in load_snapshots()}
    snapshot = snapshots.get(snapshot_id)
    if snapshot is None or snapshot["status"] != "available":
        raise KeyError(f"Unknown or unavailable snapshot: {snapshot_id}")
    overlay_path = snapshot.get("score_overlay")
    if overlay_path:
        overlay = _read(overlay_path)
        scores = {item["fixture_id"]: item for item in overlay["scores"]}
        for fixture in fixtures:
            if fixture["id"] in scores:
                fixture.update(
                    {
                        "home_score": scores[fixture["id"]]["home_score"],
                        "away_score": scores[fixture["id"]]["away_score"],
                    }
                )
    return [Fixture(**item) for item in fixtures]
