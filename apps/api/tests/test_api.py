from app.main import app
from fastapi.testclient import TestClient


def test_health_and_catalog():
    with TestClient(app) as client:
        assert client.get("/api/health").json()["status"] == "ok"
        assert len(client.get("/api/teams").json()) == 48
        assert len(client.get("/api/groups").json()) == 12
        assert len(client.get("/api/fixtures").json()) == 72


def test_preview_save_and_load_prediction():
    with TestClient(app) as client:
        preview = client.post("/api/tournament/preview", json={}).json()
        assert preview["progress"]["completed_group_matches"] == 0
        saved = client.post("/api/predictions", json={})
        assert saved.status_code == 201
        prediction_id = saved.json()["id"]
        assert client.get(f"/api/predictions/{prediction_id}").json()["id"] == prediction_id
        assert client.get("/api/predictions/missing").status_code == 404


def test_invalid_score_and_runs_are_rejected():
    with TestClient(app) as client:
        invalid = client.post(
            "/api/tournament/preview", json={"scores": [{"fixture_id": "a-1", "home_score": 1, "away_score": None}]}
        )
        assert invalid.status_code == 422
        assert client.get("/api/simulations/monte-carlo?runs=99").status_code == 422
