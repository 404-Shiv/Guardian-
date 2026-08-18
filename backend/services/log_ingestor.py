"""Log Ingestor Service — Parses and normalizes uploaded logs."""

import json
import csv
import io
from typing import List, Dict, Any


REQUIRED_FIELDS = ["timestamp", "source_ip", "destination_ip", "user", "host", "event", "severity", "action"]
OPTIONAL_FIELDS = ["raw_log"]

SEVERITY_NORMALIZE = {
    "info": "low",
    "informational": "low",
    "warning": "medium",
    "warn": "medium",
    "error": "high",
    "critical": "critical",
    "crit": "critical",
    "emergency": "critical",
    "emerg": "critical",
    "alert": "high",
}


def parse_json_logs(content: str) -> List[Dict[str, Any]]:
    """Parse JSON log content."""
    try:
        data = json.loads(content)
        if isinstance(data, dict):
            data = [data]
        elif not isinstance(data, list):
            raise ValueError("JSON must be an array of log objects or a single log object")
        return data
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON: {e}")


def parse_csv_logs(content: str) -> List[Dict[str, Any]]:
    """Parse CSV log content."""
    try:
        reader = csv.DictReader(io.StringIO(content))
        return list(reader)
    except csv.Error as e:
        raise ValueError(f"Invalid CSV: {e}")


def normalize_log(raw: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize a single log entry to the standard schema."""
    normalized = {}

    for field in REQUIRED_FIELDS:
        value = raw.get(field, "")
        if value is None:
            value = ""
        normalized[field] = str(value).strip()

    # Normalize severity
    sev = normalized.get("severity", "").lower()
    normalized["severity"] = SEVERITY_NORMALIZE.get(sev, sev if sev in ("low", "medium", "high", "critical") else "medium")

    # Handle raw_log
    normalized["raw_log"] = str(raw.get("raw_log", raw.get("message", raw.get("description", "")))).strip()

    # Fill defaults
    if not normalized["user"]:
        normalized["user"] = "unknown"
    if not normalized["host"]:
        normalized["host"] = "unknown"
    if not normalized["action"]:
        normalized["action"] = "alert"

    return normalized


def ingest_logs(content: str, file_type: str = "json") -> List[Dict[str, Any]]:
    """
    Parse and normalize log content.
    Returns a list of normalized log dictionaries.
    """
    if file_type.lower() == "csv":
        raw_logs = parse_csv_logs(content)
    else:
        raw_logs = parse_json_logs(content)

    normalized = []
    for raw in raw_logs:
        try:
            normalized.append(normalize_log(raw))
        except Exception:
            continue  # Skip malformed entries

    return normalized
