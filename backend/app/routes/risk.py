"""Risk assessment route."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.models import RiskAssessment
from app.services.asset_service import get_asset_by_id
from app.services.risk_service import calculate_risk

router = APIRouter()


@router.get("/{asset_id}", response_model=RiskAssessment)
async def get_risk(asset_id: str) -> RiskAssessment:
    """Return a heuristic risk assessment for the given asset ID."""
    asset = get_asset_by_id(asset_id)
    if asset is None:
        raise HTTPException(status_code=404, detail=f"Asset '{asset_id}' not found")
    return calculate_risk(asset)
