"""Asset routes - list and retrieve infrastructure assets."""
from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query

from app.models import Asset
from app.services.asset_service import get_all_assets, get_asset_by_id

router = APIRouter()


@router.get("", response_model=List[Asset])
async def list_assets(
    type: Optional[str] = Query(None, description="Filter by asset type"),
    status: Optional[str] = Query(None, description="Filter by status"),
    region: Optional[str] = Query(None, description="Filter by region"),
    limit: int = Query(100, ge=1, le=1000, description="Max records to return"),
    offset: int = Query(0, ge=0, description="Number of records to skip"),
) -> List[Asset]:
    """Return a paginated, optionally filtered list of infrastructure assets."""
    assets = get_all_assets()

    if type:
        assets = [a for a in assets if a.type.lower() == type.lower()]
    if status:
        assets = [a for a in assets if a.status.lower() == status.lower()]
    if region:
        assets = [a for a in assets if a.region.lower() == region.lower()]

    return assets[offset : offset + limit]


@router.get("/{asset_id}", response_model=Asset)
async def get_asset(asset_id: str) -> Asset:
    """Return a single asset by its ID."""
    asset = get_asset_by_id(asset_id)
    if asset is None:
        raise HTTPException(status_code=404, detail=f"Asset '{asset_id}' not found")
    return asset
