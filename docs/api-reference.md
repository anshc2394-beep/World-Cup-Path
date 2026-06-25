# API reference

Base URL: `http://localhost:8000/api`. FastAPI serves the complete OpenAPI schema at `/openapi.json` and interactive documentation at `/docs`.

- `GET /health` — readiness check.
- `GET /snapshots` — available/default data snapshots.
- `GET /teams`, `GET /teams/{team_id}` — team catalog and detail.
- `GET /groups`, `GET /groups/{group_id}` — group catalog and detail.
- `GET /fixtures?snapshot_id=...` — 72 group fixtures.
- `POST /tournament/preview` — calculate standings, thirds, qualifiers, and bracket from scores and winner selections.
- `POST /predictions`, `GET /predictions/{id}` — save/load immutable prediction snapshots.
- `POST /simulate/match` — seeded score and probability prediction.
- `POST /simulate/tournament` — seeded full tournament.
- `GET /simulations/monte-carlo?runs=1000&seed=2026` — team stage probabilities.
- `GET /teams/{team_id}/explanation?prediction_id=...` — deterministic path narrative.

Scores must be paired integers from 0–20. Monte Carlo runs must be 100–10,000. Unknown resources return `404`; invalid inputs return `422`; invalid Annex C data returns structured `503` code `BRACKET_ALLOCATION_INVALID`.

