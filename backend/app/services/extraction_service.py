"""Extraction service - delegate to the AI extractor module."""
from __future__ import annotations

import sys
import os
from typing import Optional

# Allow importing from the /ai sibling directory
_ai_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../ai"))
if _ai_path not in sys.path:
    sys.path.insert(0, _ai_path)

try:
    from extractor import extract_from_text  # type: ignore
except ImportError:
    # Fallback: inline regex extraction if ai module is unavailable
    import re

    def extract_from_text(text: str, api_key: Optional[str] = None) -> dict:  # type: ignore[misc]
        status = re.search(r"\b(operational|degraded|critical|offline)\b", text, re.I)
        asset_type = re.search(r"\b(borehole|solar[_\s]system|solar)\b", text, re.I)
        location = re.search(
            r"\b(Nairobi|Kampala|Dar es Salaam|Kigali|Addis Ababa|Dodoma)\b", text, re.I
        )
        return {
            "asset_type": asset_type.group(1).lower().replace(" ", "_") if asset_type else "unknown",
            "location": location.group(1) if location else "unknown",
            "status": status.group(1).lower() if status else "unknown",
            "last_maintenance": "unknown",
            "confidence": 0.50,
            "method": "inline_regex",
        }


def extract_report(text: str, api_key: Optional[str] = None) -> dict:
    """Extract structured asset information from a raw report text."""
    return extract_from_text(text, api_key=api_key)
