"""Document extraction logic for NGO reports.

Supports OpenRouter API (Mistral) when an API key is provided,
with a regex-based fallback for offline / demo usage.
"""
from __future__ import annotations

import re
from typing import Optional

try:
    import httpx
    _HAS_HTTPX = True
except ImportError:
    _HAS_HTTPX = False

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = "mistralai/mistral-7b-instruct:free"

_STATUS_PATTERNS = re.compile(
    r"\b(operational|degraded|critical|offline)\b", re.IGNORECASE
)
_TYPE_PATTERNS = re.compile(
    r"\b(borehole|solar[_\s]system|solar system|solar)\b", re.IGNORECASE
)
_DATE_PATTERNS = re.compile(
    r"(?:last maintenance|maintenance date)[:\s]+(\d{4}-\d{2}-\d{2}|\w+ \d{1,2},?\s*\d{4})",
    re.IGNORECASE,
)
_LOCATION_PATTERNS = re.compile(
    r"\b(Nairobi|Kampala|Dar es Salaam|Kigali|Addis Ababa|Juba|Lusaka|"
    r"Harare|Lilongwe|Maputo|Bujumbura|Asmara|Djibouti|Mogadishu|Dodoma|"
    r"Entebbe|Mwanza|Kisumu|Mombasa|Adama|Musanze|Rubavu|Hargeisa|Jinja|Arusha)\b",
    re.IGNORECASE,
)


def _regex_extract(text: str) -> dict:
    """Fallback extraction using regex heuristics."""
    status_match = _STATUS_PATTERNS.search(text)
    type_match = _TYPE_PATTERNS.search(text)
    date_match = _DATE_PATTERNS.search(text)
    locations = _LOCATION_PATTERNS.findall(text)

    asset_type = "unknown"
    if type_match:
        raw = type_match.group(1).lower()
        asset_type = "solar_system" if "solar" in raw else "borehole"

    return {
        "asset_type": asset_type,
        "location": locations[0] if locations else "unknown",
        "status": status_match.group(1).lower() if status_match else "unknown",
        "last_maintenance": date_match.group(1) if date_match else "unknown",
        "confidence": 0.55,
        "method": "regex",
    }


def _llm_extract(text: str, api_key: str) -> dict:
    """Call OpenRouter to extract structured data from report text."""
    if not _HAS_HTTPX:
        return _regex_extract(text)

    prompt = (
        "Extract infrastructure asset information from the following NGO field report. "
        "Return ONLY a JSON object with these keys: "
        "asset_type (borehole or solar_system), location (city/region name), "
        "status (operational/degraded/critical/offline), last_maintenance (ISO date or text). "
        "If a field is not mentioned, use null.\n\n"
        f"Report:\n{text[:3000]}"
    )

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": OPENROUTER_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 256,
    }

    try:
        with httpx.Client(timeout=30) as client:
            response = client.post(OPENROUTER_URL, headers=headers, json=payload)
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]

        # Parse JSON from the LLM response
        json_match = re.search(r"\{.*\}", content, re.DOTALL)
        if json_match:
            import json
            extracted = json.loads(json_match.group())
            extracted["confidence"] = 0.85
            extracted["method"] = "llm"
            # Normalize keys
            for key in ["asset_type", "location", "status", "last_maintenance"]:
                extracted.setdefault(key, "unknown")
            return extracted
    except Exception:
        pass

    return _regex_extract(text)


def extract_from_text(text: str, api_key: Optional[str] = None) -> dict:
    """Extract structured asset information from a text report.

    Parameters
    ----------
    text:
        Raw text content of an NGO field report.
    api_key:
        OpenRouter API key. If provided, uses LLM extraction; otherwise regex.

    Returns
    -------
    dict with keys: asset_type, location, status, last_maintenance,
                    confidence, method
    """
    if api_key:
        return _llm_extract(text, api_key)
    return _regex_extract(text)
