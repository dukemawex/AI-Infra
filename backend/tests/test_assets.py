"""Tests for asset endpoints."""
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


def test_list_assets_returns_200(client):
    response = client.get("/assets")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_list_assets_has_expected_fields(client):
    response = client.get("/assets?limit=1")
    assert response.status_code == 200
    item = response.json()[0]
    for field in ["id", "type", "lat", "lon", "status", "region", "age_years", "days_since_maintenance"]:
        assert field in item, f"Field '{field}' missing from asset response"


def test_get_asset_by_valid_id(client):
    # Get first asset ID then fetch it
    all_assets = client.get("/assets?limit=1").json()
    asset_id = all_assets[0]["id"]
    response = client.get(f"/assets/{asset_id}")
    assert response.status_code == 200
    assert response.json()["id"] == asset_id


def test_get_asset_by_invalid_id_returns_404(client):
    response = client.get("/assets/DOES-NOT-EXIST")
    assert response.status_code == 404


def test_filter_by_type_borehole(client):
    response = client.get("/assets?type=borehole&limit=200")
    assert response.status_code == 200
    assets = response.json()
    assert all(a["type"] == "borehole" for a in assets)


def test_filter_by_type_solar(client):
    response = client.get("/assets?type=solar_system&limit=200")
    assert response.status_code == 200
    assets = response.json()
    assert all(a["type"] == "solar_system" for a in assets)


def test_filter_by_status(client):
    response = client.get("/assets?status=operational&limit=200")
    assert response.status_code == 200
    assets = response.json()
    assert all(a["status"] == "operational" for a in assets)


def test_pagination_offset(client):
    page1 = client.get("/assets?limit=10&offset=0").json()
    page2 = client.get("/assets?limit=10&offset=10").json()
    ids_page1 = {a["id"] for a in page1}
    ids_page2 = {a["id"] for a in page2}
    assert ids_page1.isdisjoint(ids_page2), "Pagination offset not working correctly"


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
