# GUARDIAN — Autonomous Cyber Defense Commander

AI-powered cybersecurity platform that detects threats, reconstructs attacks, simulates impact, and recommends the best response.

## Features

- **React Tactical Frontend** (`frontend-react/`) — Replicates tactical dark SOC commander interface with monospace typography, glowing attack timelines, MITRE ATT&CK tables, live terminal console with blinking cursor, and mitigation execution buttons.
- **Threat Hunter Agent** — Pattern detection (brute force, credential dumping, exfiltration, etc.)
- **Correlation Agent** — Links related events into attack chains by IP/user/host/time
- **MITRE ATT&CK Mapper** — Maps detections to ATT&CK techniques (`T1110`, `T1059.001`, `T1068`, `T1003`, `T1041`, etc.)
- **Response Agent** — Generates and scores candidate response plans
- **Adversarial Agent** — Red-team challenges exposing plan weaknesses
- **Decision Agent** — Selects optimal response with full justification

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React (Vite), Lucide Icon Recharts |
| Backend | Python, FastAPI |
| Database | SQLite |
| Simulation | NetworkX |

## Quick Start

### Windows (One-Click Launch)
```
run.bat
```

### Manual Start

```bash
# Terminal 1: Start FastAPI Backend
python -m uvicorn backend.main:app --reload --port 8000

# Terminal 2: Start React Frontend
cd frontend-react
npm run dev -- --port 3000
```

- **React Dashboard UI**: [http://localhost:3000](http://localhost:3000)
- **FastAPI API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

## Project Structure

```text
GUARDIAN/
├── backend/
│   ├── main.py              # FastAPI REST app
│   ├── database.py          # SQLite database
│   ├── models.py            # Pydantic schemas
│   ├── agents/              # 8 specialized cybersecurity agents
│   └── services/            # Ingestion & pipeline orchestrator
├── frontend-react/          # Dedicated React Web Application
│   ├── src/
│   │   ├── components/      # Header, Sidebar, Timeline, Tables
│   │   ├── views/           # IncidentCommandView, SocDashboardView, etc.
│   │   └── services/api.js  # Axios backend API client
│   └── index.html
├── data/
│   └── sample_logs.json     # Simulated attack logs
├── run.bat                  # One-click Windows launcher
└── README.md
```
