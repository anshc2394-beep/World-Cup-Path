"""Generate versioned, source-documented seed data for WorldCupPath 2026.

The Annex C lookup is extracted from the official FIFA regulations PDF. This is
a development-time generator only; the application reads the checked-in JSON.
"""

from __future__ import annotations

import hashlib
import itertools
import json
from pathlib import Path

import pdfplumber

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "packages" / "data"
PDF = ROOT / "tmp" / "pdfs" / "FWC2026_regulations_EN.pdf"
SOURCE_REGULATIONS = "https://digitalhub.fifa.com/m/636f5c9c6f29771f/original/FWC2026_regulations_EN.pdf"
SOURCE_STANDINGS = "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/standings"
SOURCE_FIXTURES = "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures"
AS_OF = "2026-06-20"

GROUPS = {
    "A": [
        ("mexico", "Mexico", "MEX", "🇲🇽", 1805),
        ("south-africa", "South Africa", "RSA", "🇿🇦", 1580),
        ("korea-republic", "Korea Republic", "KOR", "🇰🇷", 1720),
        ("czechia", "Czechia", "CZE", "🇨🇿", 1725),
    ],
    "B": [
        ("canada", "Canada", "CAN", "🇨🇦", 1740),
        ("bosnia-herzegovina", "Bosnia and Herzegovina", "BIH", "🇧🇦", 1625),
        ("qatar", "Qatar", "QAT", "🇶🇦", 1570),
        ("switzerland", "Switzerland", "SUI", "🇨🇭", 1810),
    ],
    "C": [
        ("brazil", "Brazil", "BRA", "🇧🇷", 1910),
        ("morocco", "Morocco", "MAR", "🇲🇦", 1840),
        ("haiti", "Haiti", "HAI", "🇭🇹", 1510),
        ("scotland", "Scotland", "SCO", "🏴", 1710),
    ],
    "D": [
        ("usa", "USA", "USA", "🇺🇸", 1790),
        ("paraguay", "Paraguay", "PAR", "🇵🇾", 1700),
        ("australia", "Australia", "AUS", "🇦🇺", 1715),
        ("turkiye", "Türkiye", "TUR", "🇹🇷", 1760),
    ],
    "E": [
        ("germany", "Germany", "GER", "🇩🇪", 1880),
        ("curacao", "Curaçao", "CUW", "🇨🇼", 1505),
        ("cote-divoire", "Côte d'Ivoire", "CIV", "🇨🇮", 1735),
        ("ecuador", "Ecuador", "ECU", "🇪🇨", 1815),
    ],
    "F": [
        ("netherlands", "Netherlands", "NED", "🇳🇱", 1900),
        ("japan", "Japan", "JPN", "🇯🇵", 1810),
        ("sweden", "Sweden", "SWE", "🇸🇪", 1770),
        ("tunisia", "Tunisia", "TUN", "🇹🇳", 1640),
    ],
    "G": [
        ("belgium", "Belgium", "BEL", "🇧🇪", 1835),
        ("egypt", "Egypt", "EGY", "🇪🇬", 1680),
        ("iran", "IR Iran", "IRN", "🇮🇷", 1765),
        ("new-zealand", "New Zealand", "NZL", "🇳🇿", 1515),
    ],
    "H": [
        ("spain", "Spain", "ESP", "🇪🇸", 1930),
        ("cabo-verde", "Cabo Verde", "CPV", "🇨🇻", 1560),
        ("saudi-arabia", "Saudi Arabia", "KSA", "🇸🇦", 1615),
        ("uruguay", "Uruguay", "URU", "🇺🇾", 1860),
    ],
    "I": [
        ("france", "France", "FRA", "🇫🇷", 1940),
        ("senegal", "Senegal", "SEN", "🇸🇳", 1795),
        ("iraq", "Iraq", "IRQ", "🇮🇶", 1585),
        ("norway", "Norway", "NOR", "🇳🇴", 1810),
    ],
    "J": [
        ("argentina", "Argentina", "ARG", "🇦🇷", 1960),
        ("algeria", "Algeria", "ALG", "🇩🇿", 1690),
        ("austria", "Austria", "AUT", "🇦🇹", 1800),
        ("jordan", "Jordan", "JOR", "🇯🇴", 1565),
    ],
    "K": [
        ("portugal", "Portugal", "POR", "🇵🇹", 1915),
        ("congo-dr", "Congo DR", "COD", "🇨🇩", 1595),
        ("uzbekistan", "Uzbekistan", "UZB", "🇺🇿", 1630),
        ("colombia", "Colombia", "COL", "🇨🇴", 1845),
    ],
    "L": [
        ("england", "England", "ENG", "🏴", 1920),
        ("croatia", "Croatia", "CRO", "🇭🇷", 1825),
        ("ghana", "Ghana", "GHA", "🇬🇭", 1650),
        ("panama", "Panama", "PAN", "🇵🇦", 1620),
    ],
}


def dump(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def build_catalog() -> None:
    teams = []
    groups = []
    fixtures = []
    ratings = []
    pairings = [(0, 1), (2, 3), (0, 2), (3, 1), (3, 0), (1, 2)]
    for group_id, raw_teams in GROUPS.items():
        team_ids = []
        for index, (team_id, name, code, flag, elo) in enumerate(raw_teams):
            attack = max(55, min(94, round(72 + (elo - 1600) / 18 + (index % 2))))
            defense = max(55, min(94, round(71 + (elo - 1600) / 19 - (index % 2))))
            team = {
                "id": team_id,
                "name": name,
                "fifa_code": code,
                "group": group_id,
                "flag_emoji": flag,
                "elo_rating": elo,
                "attack_rating": attack,
                "defense_rating": defense,
            }
            teams.append(team)
            ratings.append({key: team[key] for key in ("id", "elo_rating", "attack_rating", "defense_rating")})
            team_ids.append(team_id)
        groups.append({"id": group_id, "name": f"Group {group_id}", "team_ids": team_ids})
        for matchday, (home_idx, away_idx) in enumerate(pairings, 1):
            fixtures.append(
                {
                    "id": f"{group_id.lower()}-{matchday}",
                    "group": group_id,
                    "matchday": (matchday + 1) // 2,
                    "home_team_id": team_ids[home_idx],
                    "away_team_id": team_ids[away_idx],
                    "home_score": None,
                    "away_score": None,
                }
            )

    dump(DATA / "teams.json", teams)
    dump(DATA / "groups.json", groups)
    dump(DATA / "fixtures.json", fixtures)
    dump(DATA / "ratings.json", ratings)
    demo_scores = [
        {"fixture_id": f["id"], "home_score": (i * 2 + 1) % 4, "away_score": i % 3} for i, f in enumerate(fixtures)
    ]
    dump(DATA / "snapshots" / "sample-demo.json", {"snapshot_id": "sample-demo", "scores": demo_scores})
    dump(
        DATA / "snapshots.json",
        [
            {
                "id": "official-pre-tournament",
                "label": "Official pre-tournament",
                "status": "available",
                "default": True,
                "score_overlay": None,
            },
            {
                "id": "sample-demo",
                "label": "Sample completed tournament",
                "status": "available",
                "default": False,
                "score_overlay": "snapshots/sample-demo.json",
            },
            {
                "id": "live-snapshot",
                "label": "Live snapshot",
                "status": "future",
                "default": False,
                "score_overlay": None,
            },
        ],
    )
    dump(
        DATA / "manifest.json",
        {
            "schema_version": "1.0.0",
            "default_snapshot": "official-pre-tournament",
            "as_of": AS_OF,
            "scores": "blank",
            "sources": {
                "teams_and_groups": SOURCE_STANDINGS,
                "fixtures": SOURCE_FIXTURES,
                "regulations": SOURCE_REGULATIONS,
            },
            "ratings_notice": "Illustrative model seed ratings created for this educational project; not official FIFA ratings.",
        },
    )


def build_annex_c() -> None:
    if not PDF.exists():
        raise SystemExit(f"Missing {PDF}. Download the official regulations PDF first.")
    slots = ["1A", "1B", "1D", "1E", "1G", "1I", "1K", "1L"]
    allocations: dict[str, dict[str, str]] = {}
    option_count = 0
    with pdfplumber.open(PDF) as pdf:
        for page in pdf.pages[79:97]:
            for table in page.extract_tables():
                for row in table:
                    if not row or not row[0] or row[0] == "Option":
                        continue
                    try:
                        option = int(row[0])
                    except ValueError:
                        continue
                    opponents = [value.strip() for value in row[1:9]]
                    if len(opponents) != 8 or any(not value.startswith("3") for value in opponents):
                        raise ValueError(f"Malformed Annex C row {row!r}")
                    groups = [value[1:] for value in opponents]
                    key = "".join(sorted(groups))
                    if key in allocations:
                        raise ValueError(f"Duplicate Annex C combination {key}")
                    allocations[key] = dict(zip(slots, groups, strict=True))
                    option_count += 1
                    if option != option_count:
                        raise ValueError(f"Expected option {option_count}, found {option}")
    expected_keys = {"".join(combo) for combo in itertools.combinations("ABCDEFGHIJKL", 8)}
    if option_count != 495 or set(allocations) != expected_keys:
        raise ValueError(f"Expected all 495 combinations, found {option_count}")
    payload = {
        "schema_version": "1.0.0",
        "competition": "FIFA World Cup 2026",
        "annex": "C",
        "as_of": AS_OF,
        "source_url": SOURCE_REGULATIONS,
        "winner_slots": slots,
        "allocations": allocations,
    }
    canonical = json.dumps(payload["allocations"], ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    payload["checksum_sha256"] = hashlib.sha256(canonical).hexdigest()
    dump(DATA / "round-of-32-allocations.v1.json", payload)


if __name__ == "__main__":
    build_catalog()
    build_annex_c()
    print("Generated official-pre-tournament catalog and 495 Annex C allocations.")
