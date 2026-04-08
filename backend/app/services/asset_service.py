"""Asset service - load and cache infrastructure data from CSV."""
from __future__ import annotations

from datetime import date
from typing import Dict, List, Optional

import pandas as pd

from app.models import Asset

_cache: Dict[str, Asset] = {}


def load_assets(csv_path: str) -> None:
    """Load the infrastructure CSV into the in-memory cache.

    Parameters
    ----------
    csv_path:
        Path to infrastructure.csv.
    """
    global _cache
    _cache = {}

    df = pd.read_csv(csv_path)
    today = date.today()

    for _, row in df.iterrows():
        install_date = date.fromisoformat(str(row["install_date"]))
        last_maint = date.fromisoformat(str(row["last_maintenance"]))

        age_years = round((today - install_date).days / 365.25, 2)
        days_since_maintenance = (today - last_maint).days

        depth_m = int(row["depth_m"]) if pd.notna(row.get("depth_m")) else None
        capacity_kw = float(row["capacity_kw"]) if pd.notna(row.get("capacity_kw")) else None

        asset = Asset(
            id=str(row["id"]),
            type=str(row["type"]),
            lat=float(row["lat"]),
            lon=float(row["lon"]),
            install_date=str(row["install_date"]),
            last_maintenance=str(row["last_maintenance"]),
            status=str(row["status"]),
            usage_level=str(row["usage_level"]),
            region=str(row["region"]),
            depth_m=depth_m,
            capacity_kw=capacity_kw,
            age_years=age_years,
            days_since_maintenance=days_since_maintenance,
        )
        _cache[asset.id] = asset


def get_all_assets() -> List[Asset]:
    """Return all cached assets as a list."""
    return list(_cache.values())


def get_asset_by_id(asset_id: str) -> Optional[Asset]:
    """Return the asset with the given ID, or None if not found."""
    return _cache.get(asset_id)
