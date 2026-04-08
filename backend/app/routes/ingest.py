"""Report ingestion route - upload NGO text reports for AI extraction."""
from __future__ import annotations

import os

from fastapi import APIRouter, File, UploadFile

from app.models import IngestResponse
from app.services.extraction_service import extract_report

router = APIRouter()


@router.post("/report", response_model=IngestResponse)
async def ingest_report(file: UploadFile = File(...)) -> IngestResponse:
    """Upload a plain-text NGO field report and extract structured asset data."""
    content = await file.read()
    text = content.decode("utf-8", errors="replace")

    api_key = os.getenv("OPENROUTER_API_KEY") or None
    extracted = extract_report(text, api_key=api_key)

    return IngestResponse(
        message="Report processed successfully",
        extracted=extracted,
    )
