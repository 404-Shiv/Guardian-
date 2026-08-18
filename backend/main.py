"""GUARDIAN — FastAPI Backend."""

import json
import os
import sys
from typing import Optional

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Ensure project root is on path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import (
    init_db, insert_logs, get_all_logs, clear_logs,
    get_all_incidents, get_incident, get_dashboard_stats, get_all_alerts,
)
from backend.services.log_ingestor import ingest_logs
from backend.services.pipeline import run_pipeline

app = FastAPI(
    title="GUARDIAN",
    description="Autonomous Cyber Defense Commander — AI-Powered Threat Detection & Response",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    init_db()


# ──────────────────────────── Log Endpoints ────────────────────────────

@app.post("/api/logs/upload")
async def upload_logs(file: Optional[UploadFile] = File(None)):
    """
    Upload log files (JSON or CSV).
    If no file is provided, loads the sample data.
    """
    if file:
        content = await file.read()
        content_str = content.decode("utf-8")
        file_type = "csv" if file.filename and file.filename.endswith(".csv") else "json"
    else:
        # Load sample data
        sample_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "sample_logs.json")
        if not os.path.exists(sample_path):
            raise HTTPException(status_code=404, detail="Sample data file not found")
        with open(sample_path, "r") as f:
            content_str = f.read()
        file_type = "json"

    try:
        normalized = ingest_logs(content_str, file_type)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not normalized:
        raise HTTPException(status_code=400, detail="No valid log entries found")

    log_ids = insert_logs(normalized)

    return {
        "message": f"Successfully ingested {len(normalized)} log entries",
        "logs_count": len(normalized),
        "log_ids": log_ids,
    }


@app.post("/api/logs/upload-sample")
async def upload_sample_logs():
    """Load the built-in sample logs."""
    sample_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "sample_logs.json")
    if not os.path.exists(sample_path):
        raise HTTPException(status_code=404, detail="Sample data file not found")
    with open(sample_path, "r") as f:
        content_str = f.read()

    try:
        normalized = ingest_logs(content_str, "json")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    log_ids = insert_logs(normalized)

    return {
        "message": f"Successfully ingested {len(normalized)} sample log entries",
        "logs_count": len(normalized),
        "log_ids": log_ids,
    }


@app.get("/api/logs")
async def list_logs():
    """List all ingested logs."""
    logs = get_all_logs()
    return {"logs": logs, "count": len(logs)}


@app.delete("/api/logs")
async def delete_logs():
    """Clear all logs."""
    clear_logs()
    return {"message": "All logs cleared"}


# ──────────────────────────── Analysis Endpoints ────────────────────────────

@app.post("/api/analyze")
async def analyze_logs():
    """Run the full GUARDIAN analysis pipeline on all ingested logs."""
    logs = get_all_logs()
    if not logs:
        raise HTTPException(status_code=400, detail="No logs to analyze. Upload logs first.")

    try:
        incident = run_pipeline(logs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    return {
        "message": "Analysis complete",
        "incident": incident,
    }


# ──────────────────────────── Incident Endpoints ────────────────────────────

@app.get("/api/incidents")
async def list_incidents():
    """List all detected incidents."""
    incidents = get_all_incidents()
    return {"incidents": incidents, "count": len(incidents)}


@app.get("/api/incidents/{incident_id}")
async def get_incident_detail(incident_id: str):
    """Get full details of an incident."""
    incident = get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return {"incident": incident}


@app.post("/api/incidents/{incident_id}/respond")
async def execute_response(incident_id: str, plan_id: str = "plan_c"):
    """Execute a response plan for an incident."""
    incident = get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    plan = None
    for p in incident.get("response_plans", []):
        if p.get("plan_id") == plan_id:
            plan = p
            break

    if not plan:
        raise HTTPException(status_code=404, detail=f"Plan {plan_id} not found")

    return {
        "message": f"Response plan '{plan['name']}' executed successfully",
        "plan": plan,
        "status": "executed",
    }


# ──────────────────────────── Dashboard Endpoints ────────────────────────────

@app.get("/api/dashboard/stats")
async def dashboard_stats():
    """Get aggregated dashboard statistics."""
    stats = get_dashboard_stats()
    return stats


@app.get("/api/alerts")
async def list_alerts():
    """List all alerts."""
    alerts = get_all_alerts()
    return {"alerts": alerts, "count": len(alerts)}


# ──────────────────────────── Health ────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "operational", "service": "GUARDIAN", "version": "1.0.0"}


@app.get("/")
async def root():
    return {
        "service": "GUARDIAN — Autonomous Cyber Defense Commander",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health",
    }
