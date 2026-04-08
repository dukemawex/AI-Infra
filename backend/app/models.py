"""Pydantic models for the AI Infrastructure Intelligence Layer API."""
from __future__ import annotations

from typing import Any, List, Optional

from pydantic import BaseModel


class AssetBase(BaseModel):
    id: str
    type: str
    lat: float
    lon: float
    install_date: str
    last_maintenance: str
    status: str
    usage_level: str
    region: str


class Asset(AssetBase):
    depth_m: Optional[int] = None
    capacity_kw: Optional[float] = None
    age_years: float
    days_since_maintenance: int


class RiskAssessment(BaseModel):
    asset_id: str
    risk_score: float  # 0–100
    confidence: float  # 0–1
    risk_level: str    # "low", "medium", "high", "critical"
    recommendation: str
    estimated_cost_usd: Optional[int] = None
    data_source: str
    disclaimer: str


class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    geometry: dict[str, Any]
    properties: dict[str, Any]


class GeoJSONCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]


class IngestResponse(BaseModel):
    message: str
    extracted: dict[str, Any]
