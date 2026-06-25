from __future__ import annotations

import os
import secrets
from contextlib import asynccontextmanager

import numpy as np
from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from worldcup_simulator import (
    BracketAllocationError,
    build_tournament_state,
    generate_team_explanation,
    predict_match,
    run_monte_carlo_simulations,
    simulate_score,
    simulate_tournament,
)
from worldcup_simulator.bracket import load_allocation_data
from worldcup_simulator.data import load_fixtures, load_groups, load_manifest, load_snapshots, load_teams

from .db import Prediction, SessionLocal, init_db
from .schemas import MatchSimulationInput, TournamentStateInput


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@asynccontextmanager
async def lifespan(_: FastAPI):
    load_allocation_data()
    init_db()
    yield


app = FastAPI(title="WorldCupPath 2026 API", version="1.0.0", lifespan=lifespan)
origins = [
    item.strip()
    for item in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
    if item.strip()
]
app.add_middleware(
    CORSMiddleware, allow_origins=origins, allow_credentials=False, allow_methods=["*"], allow_headers=["*"]
)


@app.exception_handler(BracketAllocationError)
async def allocation_error(_: Request, exc: BracketAllocationError):
    return JSONResponse(
        status_code=503,
        content={
            "error": {
                "code": "BRACKET_ALLOCATION_INVALID",
                "message": str(exc),
                "developer_hint": "Regenerate and validate packages/data/round-of-32-allocations.v1.json",
            }
        },
    )


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "worldcup-path-api", "version": "1.0.0"}


@app.get("/api/snapshots")
def snapshots():
    return {"default": load_manifest()["default_snapshot"], "snapshots": load_snapshots()}


@app.get("/api/teams")
def teams(group: str | None = None):
    items = load_teams()
    if group:
        items = [team for team in items if team.group == group.upper()]
    return [team.to_dict() for team in items]


@app.get("/api/teams/{team_id}")
def team(team_id: str):
    item = next((team for team in load_teams() if team.id == team_id), None)
    if not item:
        raise HTTPException(404, "Team not found")
    fixtures = [
        fixture.to_dict() for fixture in load_fixtures() if team_id in (fixture.home_team_id, fixture.away_team_id)
    ]
    return {**item.to_dict(), "fixtures": fixtures}


@app.get("/api/groups")
def groups():
    return load_groups()


@app.get("/api/groups/{group_id}")
def group(group_id: str):
    group_id = group_id.upper()
    item = next((group for group in load_groups() if group["id"] == group_id), None)
    if not item:
        raise HTTPException(404, "Group not found")
    team_map = {team.id: team.to_dict() for team in load_teams()}
    fixtures = [fixture.to_dict() for fixture in load_fixtures() if fixture.group == group_id]
    return {**item, "teams": [team_map[team_id] for team_id in item["team_ids"]], "fixtures": fixtures}


@app.get("/api/fixtures")
def fixtures(snapshot_id: str = "official-pre-tournament"):
    try:
        return [fixture.to_dict() for fixture in load_fixtures(snapshot_id)]
    except KeyError as exc:
        raise HTTPException(404, str(exc)) from exc


@app.post("/api/tournament/preview")
def preview(payload: TournamentStateInput):
    try:
        return build_tournament_state(
            payload.snapshot_id, [item.model_dump() for item in payload.scores], payload.knockout_winners
        )
    except KeyError as exc:
        raise HTTPException(404, str(exc)) from exc


@app.post("/api/predictions", status_code=201)
def create_prediction(payload: TournamentStateInput, db: Session = Depends(get_db)):
    derived = build_tournament_state(
        payload.snapshot_id, [item.model_dump() for item in payload.scores], payload.knockout_winners
    )
    for _ in range(5):
        prediction_id = secrets.token_urlsafe(7).replace("-", "a").replace("_", "b")[:10]
        if not db.get(Prediction, prediction_id):
            break
    record = Prediction(
        id=prediction_id, snapshot_id=payload.snapshot_id, state=payload.model_dump(), derived_state=derived
    )
    db.add(record)
    db.commit()
    return {
        "id": record.id,
        "snapshot_id": record.snapshot_id,
        "state": record.state,
        "derived_state": record.derived_state,
        "created_at": record.created_at,
    }


@app.get("/api/predictions/{prediction_id}")
def get_prediction(prediction_id: str, db: Session = Depends(get_db)):
    record = db.get(Prediction, prediction_id)
    if not record:
        raise HTTPException(404, "Prediction not found")
    return {
        "id": record.id,
        "snapshot_id": record.snapshot_id,
        "state": record.state,
        "derived_state": record.derived_state,
        "created_at": record.created_at,
        "engine_version": record.engine_version,
    }


@app.post("/api/simulate/match")
def simulate_match(payload: MatchSimulationInput):
    team_map = {team.id: team for team in load_teams()}
    if payload.team_a_id not in team_map or payload.team_b_id not in team_map:
        raise HTTPException(404, "Team not found")
    rng = np.random.default_rng(payload.seed)
    score = simulate_score(team_map[payload.team_a_id], team_map[payload.team_b_id], rng)
    return {
        "team_a_id": payload.team_a_id,
        "team_b_id": payload.team_b_id,
        "team_a_score": score[0],
        "team_b_score": score[1],
        "prediction": predict_match(team_map[payload.team_a_id], team_map[payload.team_b_id]),
    }


@app.post("/api/simulate/tournament")
def simulate_full_tournament(snapshot_id: str = "official-pre-tournament", seed: int | None = None):
    try:
        return simulate_tournament(snapshot_id, seed)
    except KeyError as exc:
        raise HTTPException(404, str(exc)) from exc


@app.get("/api/simulations/monte-carlo")
def monte_carlo(
    runs: int = Query(1000, ge=100, le=10_000), seed: int | None = None, snapshot_id: str = "official-pre-tournament"
):
    try:
        return run_monte_carlo_simulations(runs, snapshot_id, seed)
    except KeyError as exc:
        raise HTTPException(404, str(exc)) from exc


@app.get("/api/teams/{team_id}/explanation")
def explanation(team_id: str, prediction_id: str | None = None, db: Session = Depends(get_db)):
    if not any(team.id == team_id for team in load_teams()):
        raise HTTPException(404, "Team not found")
    if prediction_id:
        record = db.get(Prediction, prediction_id)
        if not record:
            raise HTTPException(404, "Prediction not found")
        state = record.derived_state
    else:
        state = build_tournament_state()
    return generate_team_explanation(team_id, state)
