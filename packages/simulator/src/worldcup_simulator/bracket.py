from __future__ import annotations

import hashlib
import itertools
import json
from functools import lru_cache
from pathlib import Path

from .data import data_root
from .models import StandingRow


class BracketAllocationError(RuntimeError):
    """Raised when the checked-in FIFA Annex C allocation artifact is invalid."""


WINNER_SLOTS = ["1A", "1B", "1D", "1E", "1G", "1I", "1K", "1L"]


@lru_cache(maxsize=2)
def load_allocation_data(path: Path | None = None) -> dict:
    artifact = path or data_root() / "round-of-32-allocations.v1.json"
    try:
        payload = json.loads(artifact.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise BracketAllocationError(f"Unable to read Annex C allocation artifact: {artifact}") from exc
    validate_allocation_data(payload)
    return payload


def validate_allocation_data(payload: dict) -> None:
    allocations = payload.get("allocations", {})
    expected_keys = {"".join(combo) for combo in itertools.combinations("ABCDEFGHIJKL", 8)}
    if payload.get("schema_version") != "1.0.0" or payload.get("winner_slots") != WINNER_SLOTS:
        raise BracketAllocationError("Unsupported Annex C allocation schema or winner slots")
    if len(allocations) != 495 or set(allocations) != expected_keys:
        raise BracketAllocationError("Annex C artifact must contain exactly all 495 group combinations")
    for key, mapping in allocations.items():
        if set(mapping) != set(WINNER_SLOTS) or sorted(mapping.values()) != sorted(key):
            raise BracketAllocationError(f"Invalid or duplicated allocation for qualifying groups {key}")
    canonical = json.dumps(allocations, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    if hashlib.sha256(canonical).hexdigest() != payload.get("checksum_sha256"):
        raise BracketAllocationError("Annex C allocation checksum mismatch; regenerate the artifact")


def _team_at(groups: dict[str, list[StandingRow]], slot: str) -> str:
    return groups[slot[1]][int(slot[0]) - 1].team_id


def generate_round_of_32(groups: dict[str, list[StandingRow]], third_places: list[StandingRow]) -> list[dict]:
    qualified_thirds = third_places[:8]
    key = "".join(sorted(row.group for row in qualified_thirds))
    allocation = load_allocation_data()["allocations"].get(key)
    if not allocation:
        raise BracketAllocationError(f"No official Annex C allocation for third-place groups {key}")
    third_by_group = {row.group: row.team_id for row in qualified_thirds}

    def third(winner_slot: str) -> str:
        return third_by_group[allocation[winner_slot]]

    pairs = {
        73: (_team_at(groups, "2A"), _team_at(groups, "2B")),
        74: (_team_at(groups, "1E"), third("1E")),
        75: (_team_at(groups, "1F"), _team_at(groups, "2C")),
        76: (_team_at(groups, "1C"), _team_at(groups, "2F")),
        77: (_team_at(groups, "1I"), third("1I")),
        78: (_team_at(groups, "2E"), _team_at(groups, "2I")),
        79: (_team_at(groups, "1A"), third("1A")),
        80: (_team_at(groups, "1L"), third("1L")),
        81: (_team_at(groups, "1D"), third("1D")),
        82: (_team_at(groups, "1G"), third("1G")),
        83: (_team_at(groups, "2K"), _team_at(groups, "2L")),
        84: (_team_at(groups, "1H"), _team_at(groups, "2J")),
        85: (_team_at(groups, "1B"), third("1B")),
        86: (_team_at(groups, "1J"), _team_at(groups, "2H")),
        87: (_team_at(groups, "1K"), third("1K")),
        88: (_team_at(groups, "2D"), _team_at(groups, "2G")),
    }
    return [
        {"match_id": str(match_id), "round": "Round of 32", "team_a_id": pair[0], "team_b_id": pair[1]}
        for match_id, pair in pairs.items()
    ]


PROGRESSION = {
    89: (74, 77),
    90: (73, 75),
    91: (76, 78),
    92: (79, 80),
    93: (83, 84),
    94: (81, 82),
    95: (86, 88),
    96: (85, 87),
    97: (89, 90),
    98: (93, 94),
    99: (91, 92),
    100: (95, 96),
    101: (97, 98),
    102: (99, 100),
    103: (101, 102),
    104: (101, 102),
}
ROUND_NAMES = {
    **{i: "Round of 16" for i in range(89, 97)},
    **{i: "Quarterfinal" for i in range(97, 101)},
    101: "Semifinal",
    102: "Semifinal",
    103: "Third place",
    104: "Final",
}


def build_bracket(
    groups: dict[str, list[StandingRow]], thirds: list[StandingRow], winners: dict[str, str] | None = None
) -> list[dict]:
    winners = winners or {}
    bracket = generate_round_of_32(groups, thirds)
    by_id = {item["match_id"]: item for item in bracket}
    for match_id in range(89, 105):
        source_a, source_b = PROGRESSION[match_id]
        if match_id == 103:

            def loser(source: int) -> str | None:
                match = by_id[str(source)]
                winner = winners.get(str(source))
                if not winner or not match.get("team_a_id") or not match.get("team_b_id"):
                    return None
                return match["team_b_id"] if winner == match["team_a_id"] else match["team_a_id"]

            team_a, team_b = loser(source_a), loser(source_b)
        else:
            team_a, team_b = winners.get(str(source_a)), winners.get(str(source_b))
        item = {
            "match_id": str(match_id),
            "round": ROUND_NAMES[match_id],
            "team_a_id": team_a,
            "team_b_id": team_b,
            "source_a": str(source_a),
            "source_b": str(source_b),
        }
        bracket.append(item)
        by_id[str(match_id)] = item
    for item in bracket:
        item["winner_id"] = winners.get(item["match_id"])
    return bracket
