"""SQLite database for GUARDIAN."""

import sqlite3
import json
import os
from typing import List, Dict, Any, Optional
from datetime import datetime


DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "guardian.db")


def get_connection() -> sqlite3.Connection:
    """Get a database connection."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
    """Initialize database tables."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            source_ip TEXT NOT NULL,
            destination_ip TEXT NOT NULL,
            user TEXT NOT NULL,
            host TEXT NOT NULL,
            event TEXT NOT NULL,
            severity TEXT NOT NULL,
            action TEXT NOT NULL,
            raw_log TEXT DEFAULT '',
            ingested_at TEXT DEFAULT (datetime('now'))
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS incidents (
            id TEXT PRIMARY KEY,
            created_at TEXT DEFAULT (datetime('now')),
            status TEXT DEFAULT 'detected',
            data TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            incident_id TEXT,
            timestamp TEXT NOT NULL,
            attack_type TEXT NOT NULL,
            severity TEXT NOT NULL,
            confidence REAL NOT NULL,
            source_ip TEXT,
            target_user TEXT,
            target_host TEXT,
            evidence TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (incident_id) REFERENCES incidents(id)
        )
    """)

    conn.commit()
    conn.close()


def insert_logs(logs: List[Dict[str, Any]]) -> List[int]:
    """Insert log entries and return their IDs."""
    conn = get_connection()
    cursor = conn.cursor()
    ids = []

    for log in logs:
        cursor.execute("""
            INSERT INTO logs (timestamp, source_ip, destination_ip, user, host, event, severity, action, raw_log)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            log.get("timestamp", ""),
            log.get("source_ip", ""),
            log.get("destination_ip", ""),
            log.get("user", ""),
            log.get("host", ""),
            log.get("event", ""),
            log.get("severity", ""),
            log.get("action", ""),
            log.get("raw_log", ""),
        ))
        ids.append(cursor.lastrowid)

    conn.commit()
    conn.close()
    return ids


def get_all_logs() -> List[Dict[str, Any]]:
    """Retrieve all logs."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM logs ORDER BY timestamp ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def clear_logs():
    """Clear all logs."""
    conn = get_connection()
    conn.execute("DELETE FROM logs")
    conn.commit()
    conn.close()


def save_incident(incident_id: str, data: Dict[str, Any]):
    """Save or update an incident."""
    conn = get_connection()
    cursor = conn.cursor()

    json_data = json.dumps(data, default=str)

    cursor.execute("""
        INSERT OR REPLACE INTO incidents (id, created_at, status, data)
        VALUES (?, ?, ?, ?)
    """, (
        incident_id,
        data.get("created_at", datetime.now().isoformat()),
        data.get("status", "detected"),
        json_data,
    ))

    conn.commit()
    conn.close()


def get_incident(incident_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve an incident by ID."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM incidents WHERE id = ?", (incident_id,))
    row = cursor.fetchone()
    conn.close()

    if row:
        data = json.loads(row["data"])
        data["id"] = row["id"]
        data["created_at"] = row["created_at"]
        data["status"] = row["status"]
        return data
    return None


def get_all_incidents() -> List[Dict[str, Any]]:
    """Retrieve all incidents."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM incidents ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()

    incidents = []
    for row in rows:
        data = json.loads(row["data"])
        data["id"] = row["id"]
        data["created_at"] = row["created_at"]
        data["status"] = row["status"]
        incidents.append(data)
    return incidents


def save_alert(alert: Dict[str, Any]):
    """Save an alert."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO alerts (incident_id, timestamp, attack_type, severity, confidence, source_ip, target_user, target_host, evidence)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        alert.get("incident_id"),
        alert.get("timestamp", datetime.now().isoformat()),
        alert.get("attack_type", "Unknown"),
        alert.get("severity", "medium"),
        alert.get("confidence", 0.0),
        alert.get("source_ip"),
        alert.get("target_user"),
        alert.get("target_host"),
        json.dumps(alert.get("evidence", [])),
    ))
    conn.commit()
    conn.close()


def get_all_alerts() -> List[Dict[str, Any]]:
    """Retrieve all alerts."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM alerts ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()

    alerts = []
    for row in rows:
        alert = dict(row)
        if alert.get("evidence"):
            try:
                alert["evidence"] = json.loads(alert["evidence"])
            except (json.JSONDecodeError, TypeError):
                pass
        alerts.append(alert)
    return alerts


def get_dashboard_stats() -> Dict[str, Any]:
    """Get aggregated dashboard statistics."""
    conn = get_connection()
    cursor = conn.cursor()

    # Total alerts by severity
    cursor.execute("SELECT severity, COUNT(*) as count FROM alerts GROUP BY severity")
    severity_counts = {row["severity"]: row["count"] for row in cursor.fetchall()}

    # Total logs
    cursor.execute("SELECT COUNT(*) as count FROM logs")
    total_logs = cursor.fetchone()["count"]

    # Blocked actions
    cursor.execute("SELECT COUNT(*) as count FROM logs WHERE action = 'block'")
    blocked = cursor.fetchone()["count"]

    # Alerts over time
    cursor.execute("""
        SELECT substr(timestamp, 1, 16) as time_bucket, COUNT(*) as count
        FROM alerts GROUP BY time_bucket ORDER BY time_bucket
    """)
    alerts_over_time = [{"time": row["time_bucket"], "count": row["count"]} for row in cursor.fetchall()]

    # Attack types distribution
    cursor.execute("SELECT attack_type, COUNT(*) as count FROM alerts GROUP BY attack_type")
    attack_types = [{"type": row["attack_type"], "count": row["count"]} for row in cursor.fetchall()]

    # Recent alerts
    cursor.execute("SELECT * FROM alerts ORDER BY created_at DESC LIMIT 20")
    recent = []
    for row in cursor.fetchall():
        alert = dict(row)
        if alert.get("evidence"):
            try:
                alert["evidence"] = json.loads(alert["evidence"])
            except (json.JSONDecodeError, TypeError):
                pass
        recent.append(alert)

    # Incidents count
    cursor.execute("SELECT COUNT(*) as count FROM incidents")
    incidents_count = cursor.fetchone()["count"]

    conn.close()

    total_alerts = sum(severity_counts.values())
    severity_distribution = [{"severity": k, "count": v} for k, v in severity_counts.items()]

    return {
        "total_alerts": total_alerts,
        "high_severity": severity_counts.get("high", 0),
        "medium_severity": severity_counts.get("medium", 0),
        "low_severity": severity_counts.get("low", 0),
        "critical_severity": severity_counts.get("critical", 0),
        "threats_blocked": blocked,
        "incidents_count": incidents_count,
        "alerts_over_time": alerts_over_time,
        "attack_types": attack_types,
        "severity_distribution": severity_distribution,
        "recent_alerts": recent,
    }


# Initialize on import
init_db()
