"""Tests for risk assessment endpoint."""
from __future__ import annotations

import os
import pathlib
import pytest
from fastapi.testclient import TestClient

# Resolve infrastructure.csv relative to this test file regardless of cwd
_REPO_ROOT = pathlib.Path(__file__).resolve().parents[2]
_CSV_PATH = str(_REPO_ROOT / "data" / "infrastructure.csv")
os.environ["DATA_PATH"] = _CSV_PATH

from main import app  # noqa: E402
from app.services.asset_service import load_assets  # noqa: E402


def _find_data_path() -> str:
    if os.path.exists(_CSV_PATH):
        return _CSV_PATH
    raise FileNotFoundError(f"infrastructure.csv not found at {_CSV_PATH}; run data/generate_data.py first")


@pytest.fixture(scope="module")
def client():
    load_assets(_find_data_path())
    with TestClient(app) as c:
        yield c


def test_risk_endpoint_returns_200(client):
    all_assets = client.get("/assets?limit=1").json()
    asset_id = all_assets[0]["id"]
    response = client.get(f"/risk/{asset_id}")
    assert response.status_code == 200


def test_risk_score_in_range(client):
    all_assets = client.get("/assets?limit=20").json()
    for asset in all_assets:
        response = client.get(f"/risk/{asset['id']}")
        assert response.status_code == 200
        score = response.json()["risk_score"]
        assert 0 <= score <= 100, f"Risk score {score} out of range for {asset['id']}"


def test_risk_level_is_valid(client):
    valid_levels = {"low", "medium", "high", "critical"}
    all_assets = client.get("/assets?limit=20").json()
    for asset in all_assets:
        response = client.get(f"/risk/{asset['id']}")
        level = response.json()["risk_level"]
        assert level in valid_levels, f"Invalid risk level '{level}' for {asset['id']}"


def test_risk_confidence_in_range(client):
    all_assets = client.get("/assets?limit=20").json()
    for asset in all_assets:
        response = client.get(f"/risk/{asset['id']}")
        confidence = response.json()["confidence"]
        assert 0.0 <= confidence <= 1.0, f"Confidence {confidence} out of range"


def test_risk_has_recommendation(client):
    all_assets = client.get("/assets?limit=1").json()
    asset_id = all_assets[0]["id"]
    response = client.get(f"/risk/{asset_id}")
    data = response.json()
    assert "recommendation" in data
    assert len(data["recommendation"]) > 0


def test_risk_has_disclaimer(client):
    all_assets = client.get("/assets?limit=1").json()
    asset_id = all_assets[0]["id"]
    response = client.get(f"/risk/{asset_id}")
    data = response.json()
    assert "disclaimer" in data
    assert len(data["disclaimer"]) > 0


def test_risk_invalid_asset_returns_404(client):
    response = client.get("/risk/ASSET-DOES-NOT-EXIST")
    assert response.status_code == 404


def test_risk_cost_estimate_present(client):
    all_assets = client.get("/assets?limit=10").json()
    for asset in all_assets:
        response = client.get(f"/risk/{asset['id']}")
        data = response.json()
        assert "estimated_cost_usd" in data
