"""Heuristic risk scoring for infrastructure assets."""
from __future__ import annotations

WEIGHT_AGE = 0.30
WEIGHT_MAINTENANCE = 0.30
WEIGHT_STATUS = 0.25
WEIGHT_USAGE = 0.15

STATUS_SCORES: dict[str, float] = {
    "operational": 0.0,
    "degraded": 35.0,
    "critical": 70.0,
    "offline": 90.0,
}

USAGE_SCORES: dict[str, float] = {
    "low": 0.0,
    "medium": 15.0,
    "high": 30.0,
}


def score_asset(
    age_years: float,
    days_since_maintenance: int,
    status: str,
    usage_level: str,
) -> dict:
    """Return a risk assessment dict for the given asset parameters.

    Parameters
    ----------
    age_years:
        How old the asset is in fractional years.
    days_since_maintenance:
        Number of days since the last recorded maintenance visit.
    status:
        Current operational status string.
    usage_level:
        Usage intensity: 'low', 'medium', or 'high'.

    Returns
    -------
    dict with keys: risk_score, confidence, factors
    """
    # Age component (max contribution at 20+ years)
    age_component = min(age_years / 20.0, 1.0) * 100.0

    # Maintenance component (max contribution at 730+ days = 2 years)
    maint_component = min(days_since_maintenance / 730.0, 1.0) * 100.0

    # Status component
    status_component = STATUS_SCORES.get(status.lower(), 50.0)

    # Usage component
    usage_component = USAGE_SCORES.get(usage_level.lower(), 15.0)

    raw_score = (
        WEIGHT_AGE * age_component
        + WEIGHT_MAINTENANCE * maint_component
        + WEIGHT_STATUS * status_component
        + WEIGHT_USAGE * usage_component
    )

    risk_score = max(0.0, min(100.0, raw_score))

    # Confidence decreases when data is sparse or inconsistent
    confidence = 0.95
    if days_since_maintenance > 1095:  # > 3 years - low data freshness
        confidence -= 0.15
    if status == "offline" and days_since_maintenance < 30:
        confidence -= 0.10
    confidence = max(0.60, confidence)

    factors = {
        "age_score": round(age_component, 2),
        "maintenance_score": round(maint_component, 2),
        "status_score": status_component,
        "usage_score": usage_component,
    }

    return {
        "risk_score": round(risk_score, 2),
        "confidence": round(confidence, 2),
        "factors": factors,
    }
