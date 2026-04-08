# AI Infrastructure Intelligence Layer (AI-IIL)

> A production-grade monitoring and risk-scoring platform for NGO-managed borehole and solar infrastructure across East & Central Africa.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Browser                         │
│   React + Vite + TypeScript + Tailwind + Leaflet    │
│   /frontend  (port 3000)                            │
│                                                     │
│  ┌──────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │ MapView  │  │ AssetPanel  │  │ ReportUpload  │  │
│  └──────────┘  └─────────────┘  └───────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP/REST (axios)
┌──────────────────────▼──────────────────────────────┐
│                  FastAPI Backend                     │
│   /backend  (port 8000)                             │
│                                                     │
│  GET /assets      GET /assets/{id}                  │
│  GET /risk/{id}   GET /map   POST /ingest/report    │
└──────┬─────────────────────────┬────────────────────┘
       │ pandas / csv            │ AI extraction
┌──────▼──────────┐    ┌─────────▼──────────────────┐
│  /data          │    │  /ai                        │
│  infrastructure │    │  risk_model.py  (heuristic) │
│  .csv / .json   │    │  extractor.py  (LLM/regex)  │
│  reports/*.txt  │    │  pipeline.py   (utilities)  │
└─────────────────┘    └────────────────────────────-┘
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.11+ |
| Node.js | 20+ |
| Docker + Docker Compose | 24+ |
| (Optional) OpenRouter API key | — |

---

## Quick Start (Docker Compose)

```bash
# 1. Clone the repo
git clone https://github.com/your-org/AI-Infra.git
cd AI-Infra

# 2. Copy environment file
cp .env.example .env
# (Optional) Add OPENROUTER_API_KEY to .env for LLM extraction

# 3. Generate data (already committed, but re-run if needed)
cd data && python generate_data.py && cd ..

# 4. Start services
docker-compose up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# API docs: http://localhost:8000/docs
```

---

## Local Development

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Copy env
cp .env.example .env

# Run dev server
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
```

### Data Generation

```bash
cd data
python generate_data.py
# Outputs: infrastructure.csv  infrastructure.json
```

---

## API Documentation

Full interactive docs available at `http://localhost:8000/docs` (Swagger UI).

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Service health check |
| `GET` | `/assets` | List assets (filters: `type`, `status`, `region`, `limit`, `offset`) |
| `GET` | `/assets/{id}` | Get single asset by ID |
| `GET` | `/risk/{id}` | Heuristic risk assessment for asset |
| `GET` | `/map` | GeoJSON FeatureCollection (all assets) |
| `POST` | `/ingest/report` | Upload NGO text report → AI extraction |

### Example Requests

```bash
# List boreholes in Nairobi
curl "http://localhost:8000/assets?type=borehole&region=Nairobi"

# Risk assessment
curl "http://localhost:8000/risk/ASSET-0001"

# GeoJSON map data
curl "http://localhost:8000/map"

# Ingest a report
curl -X POST "http://localhost:8000/ingest/report" \
     -F "file=@data/reports/report_001.txt"
```

### Risk Assessment Model

Risk score (0–100) is computed as a weighted sum of four factors:

| Factor | Weight | Notes |
|--------|--------|-------|
| Asset age | 30% | Normalised to 20-year lifespan |
| Days since maintenance | 30% | Normalised to 730 days (2 years) |
| Status | 25% | operational=0, degraded=35, critical=70, offline=90 |
| Usage level | 15% | low=0, medium=15, high=30 |

Decision thresholds:

| Score range | Risk level | Recommendation | Est. cost (USD) |
|-------------|------------|----------------|-----------------|
| 0–29 | low | Monitor | 500 |
| 30–64 | medium | Maintenance required | 2,500 |
| 65–84 | high | Replace system | 12,000 |
| 85–100 | critical | Replace system | 12,000 |

---

## Project Structure

```
AI-Infra/
├── .env.example
├── docker-compose.yml
├── README.md
│
├── data/
│   ├── generate_data.py          # Data generation script
│   ├── infrastructure.csv        # 420 asset records
│   ├── infrastructure.json       # Same data as JSON
│   └── reports/
│       ├── report_001.txt        # NGO field reports
│       ├── report_002.txt
│       ├── report_003.txt
│       ├── report_004.txt
│       └── report_005.txt
│
├── backend/
│   ├── main.py                   # FastAPI app entry point
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env.example
│   ├── api_test.sh               # Bash smoke tests
│   ├── app/
│   │   ├── models.py             # Pydantic models
│   │   ├── routes/
│   │   │   ├── assets.py
│   │   │   ├── risk.py
│   │   │   ├── ingest.py
│   │   │   └── map.py
│   │   ├── services/
│   │   │   ├── asset_service.py
│   │   │   ├── risk_service.py
│   │   │   └── extraction_service.py
│   │   └── utils/
│   │       └── logging_config.py
│   └── tests/
│       ├── test_assets.py
│       └── test_risk.py
│
├── ai/
│   ├── risk_model.py             # Heuristic risk scoring
│   ├── extractor.py              # LLM + regex extraction
│   └── pipeline.py               # Data pipeline utilities
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── types/index.ts
│       ├── api/
│       │   ├── client.ts
│       │   └── assets.ts
│       ├── components/
│       │   ├── MapView.tsx
│       │   ├── AssetPanel.tsx
│       │   ├── RiskBadge.tsx
│       │   ├── StatsBar.tsx
│       │   └── ReportUpload.tsx
│       └── pages/
│           └── Dashboard.tsx
│
└── infra/
    └── digitalocean.yaml         # DigitalOcean App Platform spec
```

---

## Running Tests

```bash
cd backend
pip install -r requirements.txt
pytest tests/ -v
```

### Bash API smoke tests (requires running backend):

```bash
chmod +x backend/api_test.sh
./backend/api_test.sh http://localhost:8000
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENROUTER_API_KEY` | _(empty)_ | Optional. Enables LLM extraction via OpenRouter |
| `DATA_PATH` | `../data/infrastructure.csv` | Path to the infrastructure CSV file |
| `VITE_API_URL` | _(empty)_ | Frontend: backend base URL (empty = use Vite proxy) |

---

## Deployment on DigitalOcean App Platform

1. Push your repo to GitHub.
2. Edit `infra/digitalocean.yaml` — replace `your-org/AI-Infra` with your repo.
3. In the DigitalOcean control panel: **Create App → From Spec → Upload YAML**.
4. Add the `OPENROUTER_API_KEY` secret in the environment settings.
5. Deploy — DigitalOcean will build and run both services automatically.

---

## Demo Walkthrough

1. Open `http://localhost:3000` — you'll see the **Stats Bar** showing total assets, operational %, critical and offline counts.
2. The **Leaflet map** shows 420 asset markers across East Africa, colour-coded by status:
   - 🟢 Green = operational
   - 🟡 Yellow = degraded
   - 🟠 Orange = critical
   - 🔴 Red = offline
3. Click any marker to load the **Asset Panel** on the right — shows full details and a live risk assessment with score bar, recommendation, and cost estimate.
4. Click **Upload Report** to submit one of the text files from `data/reports/`. The backend extracts structured data using regex (or LLM if API key configured).

---

## Responsible AI Note

The risk scores produced by this system are generated by a **heuristic rule-based model** using available field data (age, maintenance history, operational status, usage intensity). They are **not** the output of a trained machine-learning model and carry inherent uncertainty.

**Every risk assessment includes a disclaimer** advising that scores support — not replace — expert engineering judgement. Always validate findings with on-site inspection before taking action.

When the OpenRouter LLM integration is enabled for report extraction, note that:
- LLM outputs may contain inaccuracies ("hallucinations").
- Extracted data should be reviewed by a human before being used operationally.
- No personally identifiable information should be included in uploaded reports.

---

## License

MIT © Your Organisation
