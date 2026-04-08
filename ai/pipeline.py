"""Data pipeline utilities for AI Infrastructure Intelligence Layer."""
from __future__ import annotations

import csv
from datetime import date
from typing import Any


def load_infrastructure_data(csv_path: str) -> list[dict[str, Any]]:
    """Load infrastructure records from a CSV file.

    Parameters
    ----------
    csv_path:
        Absolute or relative path to infrastructure.csv.

    Returns
    -------
    List of asset dicts with Python-native types.
    """
    assets: list[dict[str, Any]] = []
    today = date.today()

    with open(csv_path, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            asset: dict[str, Any] = {
                "id": row["id"],
                "type": row["type"],
                "lat": float(row["lat"]),
                "lon": float(row["lon"]),
                "install_date": row["install_date"],
                "last_maintenance": row["last_maintenance"],
                "status": row["status"],
                "usage_level": row["usage_level"],
                "region": row["region"],
                "depth_m": int(row["depth_m"]) if row["depth_m"] else None,
                "capacity_kw": float(row["capacity_kw"]) if row["capacity_kw"] else None,
            }

            install_date = date.fromisoformat(row["install_date"])
            last_maint = date.fromisoformat(row["last_maintenance"])
            asset["age_years"] = round((today - install_date).days / 365.25, 2)
            asset["days_since_maintenance"] = (today - last_maint).days

            assets.append(asset)

    return assets


def compute_statistics(assets: list[dict[str, Any]]) -> dict[str, Any]:
    """Compute summary statistics for a list of asset records.

    Parameters
    ----------
    assets:
        List of asset dicts as returned by :func:`load_infrastructure_data`.

    Returns
    -------
    dict containing total count, status breakdown, type breakdown,
    and region breakdown.
    """
    total = len(assets)
    status_counts: dict[str, int] = {}
    type_counts: dict[str, int] = {}
    region_counts: dict[str, int] = {}

    for asset in assets:
        status = asset.get("status", "unknown")
        asset_type = asset.get("type", "unknown")
        region = asset.get("region", "unknown")

        status_counts[status] = status_counts.get(status, 0) + 1
        type_counts[asset_type] = type_counts.get(asset_type, 0) + 1
        region_counts[region] = region_counts.get(region, 0) + 1

    operational = status_counts.get("operational", 0)
    operational_pct = round(operational / total * 100, 1) if total > 0 else 0.0

    return {
        "total": total,
        "operational_pct": operational_pct,
        "status_breakdown": status_counts,
        "type_breakdown": type_counts,
        "region_breakdown": region_counts,
    }
