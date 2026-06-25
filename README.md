# WorldCupPath 2026

WorldCupPath 2026 is a full-stack tournament prediction simulator that models the expanded 48-team World Cup format, calculates group and third-place qualification scenarios, runs Monte Carlo simulations, and explains each team's path in plain English.

> **Unofficial fan-made educational project.** This repository is not affiliated with or endorsed by FIFA. Team ratings are illustrative model inputs, not official FIFA ratings or betting advice.

## Screenshots

| Landing | Simulator | Knockout bracket |
| --- | --- | --- |
| _TODO: add `docs/screenshots/landing.png`_ | _TODO: add `docs/screenshots/simulator.png`_ | _TODO: add `docs/screenshots/bracket.png`_ |

- [ ] Add final desktop screenshots
- [ ] Add a mobile simulator screenshot
- [ ] Add a short score-to-bracket GIF

## What works

- All 12 official groups and 72 blank group fixtures
- Editable score predictions with API-authoritative standings
- Best-eight ranking across all 12 third-place teams
- Versioned, checksummed FIFA Annex C lookup covering all 495 qualifying-group combinations
- Official matches 73–104, including the bronze final
- Manual knockout winner selection after the group stage is complete
- Poisson match simulation and seeded Monte Carlo tournament probabilities
- Deterministic team-path explanations
- Immutable SQLite prediction snapshots with Remix links
- Responsive Next.js dashboard and FastAPI OpenAPI documentation

## Stack

- **Web:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Recharts, Zustand, Lucide
- **API:** FastAPI, Pydantic, SQLAlchemy 2, SQLite
- **Model:** Python 3.12, NumPy, Poisson score simulation
- **Testing:** pytest, Vitest, Testing Library, Ruff, ESLint

## Tournament format

Forty-eight teams play in 12 groups of four. The top two in every group plus the eight best third-place finishers form the Round of 32. The application implements FIFA's published matches 73–104 and uses Annex C to place the eight third-place qualifiers.

Group ordering is intentionally simplified to points, goal difference, goals scored, wins, seed rating, and team name. See [tournament rules](docs/tournament-rules.md) for the documented gap from FIFA's complete tiebreak process.

## Run locally

Prerequisites: Node.js 22+ and Python 3.12+.

### One-click Windows launch

Double-click **`Start WorldCupPath 2026.cmd`** in the project folder. It checks dependencies, starts the API and website in minimized windows, waits until both are ready, and opens the local site at `http://127.0.0.1:3000` automatically.

Double-click **`Stop WorldCupPath 2026.cmd`** when you are finished.

If you want to start it from PowerShell without automatically opening a browser, run:

```powershell
.\scripts\start-local.ps1 -NoBrowser
```

### API

```bash
cd apps/api
python -m venv .venv
# macOS/Linux: source .venv/bin/activate
# Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload
```

The API runs at `http://127.0.0.1:8000`; interactive docs are at `http://127.0.0.1:8000/docs`.

### Web

```bash
cd apps/web
npm install
npm run dev
```

Open `http://127.0.0.1:3000`. Copy `.env.example` to `.env.local` only when changing the default ports.

### Docker Compose

```bash
docker compose up --build
```

## Model overview

Expected goals combine an Elo-difference multiplier with attack and opposing-defense factors. Scores are independent Poisson draws. Drawn knockout matches use a seeded, rating-weighted penalty decision. Monte Carlo mode repeats the entire tournament and reports empirical stage probabilities. The same seed reproduces the same result.

Read the full [model explanation](docs/model-explanation.md), [architecture](docs/architecture.md), [API reference](docs/api-reference.md), and [tournament rules](docs/tournament-rules.md).

## Seed data provenance

The `official-pre-tournament` snapshot is blank by design and is documented **as of 2026-06-20**.

- Teams and groups: [FIFA standings](https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/standings)
- Fixtures: [FIFA scores and fixtures](https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures)
- Bracket and Annex C: [FIFA World Cup 2026 regulations](https://digitalhub.fifa.com/m/636f5c9c6f29771f/original/FWC2026_regulations_EN.pdf)
- Knockout progression: [FIFA knockout schedule](https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/knockout-stage-match-schedule-bracket)

The source manifest lives in `packages/data/manifest.json`. `sample-demo` is included for demonstration; `live-snapshot` is reserved but intentionally unavailable.

## API overview

Catalog endpoints expose snapshots, teams, groups, and fixtures. `POST /api/tournament/preview` calculates the current state. Prediction endpoints save/load immutable snapshots. Simulation endpoints run individual matches, full tournaments, and 100–10,000 Monte Carlo runs. See [API reference](docs/api-reference.md).

## Tests

```bash
# repository root, with the API virtual environment activated
ruff check apps/api packages/simulator
pytest -q

cd apps/web
npm run lint
npm run typecheck
npm run test
npm run build
```

## Future improvements

- Complete FIFA head-to-head and team-conduct tiebreaks
- Live snapshot ingestion behind a replaceable data adapter
- Venue, travel, lineup, injury, and form adjustments
- PostgreSQL migration with Alembic
- Background workers only if simulation workloads outgrow the synchronous cap
