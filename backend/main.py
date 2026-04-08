"""AI Infrastructure Intelligence Layer - Backend Entry Point."""
import os
import logging

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import assets, risk, ingest, map as map_router
from app.services.asset_service import load_assets
from app.utils.logging_config import setup_logging

load_dotenv()
setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Infrastructure Intelligence Layer",
    description="Production API for monitoring and risk-scoring AI infrastructure assets.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assets.router, prefix="/assets", tags=["assets"])
app.include_router(risk.router, prefix="/risk", tags=["risk"])
app.include_router(ingest.router, prefix="/ingest", tags=["ingest"])
app.include_router(map_router.router, prefix="/map", tags=["map"])


@app.on_event("startup")
async def startup_event() -> None:
    """Pre-load asset data into memory on startup."""
    data_path = os.getenv("DATA_PATH", "../data/infrastructure.csv")
    logger.info("Loading data from %s", data_path)
    load_assets(data_path)
    logger.info("Startup complete - data loaded")


@app.get("/health", tags=["health"])
async def health() -> dict:
    """Return service health status."""
    return {"status": "ok", "service": "AI-IIL Backend"}
