"""Map route - return GeoJSON FeatureCollection of all assets."""
from __future__ import annotations

from fastapi import APIRouter

from app.models import GeoJSONCollection, GeoJSONFeature
from app.services.asset_service import get_all_assets

router = APIRouter()


@router.get("", response_model=GeoJSONCollection)
async def get_map() -> GeoJSONCollection:
    """Return all assets as a GeoJSON FeatureCollection."""
    assets = get_all_assets()
    features = [
        GeoJSONFeature(
            geometry={"type": "Point", "coordinates": [a.lon, a.lat]},
            properties={
                "id": a.id,
                "type": a.type,
                "status": a.status,
                "usage_level": a.usage_level,
                "region": a.region,
                "install_date": a.install_date,
                "last_maintenance": a.last_maintenance,
                "age_years": a.age_years,
                "days_since_maintenance": a.days_since_maintenance,
                "depth_m": a.depth_m,
                "capacity_kw": a.capacity_kw,
            },
        )
        for a in assets
    ]
    return GeoJSONCollection(features=features)
