"""Timeline Agent — Builds a chronological attack timeline."""

from typing import List, Dict, Any
from datetime import datetime


def build_timeline(chain: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Build a visual timeline from the enriched attack chain.
    Each entry: timestamp, event, attack_stage, mitre_technique, mitre_id, severity, details
    """
    if not chain:
        return []

    # Sort by timestamp
    def parse_ts(entry):
        try:
            return datetime.fromisoformat(entry.get("timestamp", ""))
        except (ValueError, TypeError):
            return datetime.min

    sorted_chain = sorted(chain, key=parse_ts)

    timeline = []
    for link in sorted_chain:
        details_parts = []
        if link.get("source_ip"):
            details_parts.append(f"Source: {link['source_ip']}")
        if link.get("destination_ip"):
            details_parts.append(f"Dest: {link['destination_ip']}")
        if link.get("user") and link["user"] != "unknown":
            details_parts.append(f"User: {link['user']}")
        if link.get("host"):
            details_parts.append(f"Host: {link['host']}")

        timeline.append({
            "timestamp": link.get("timestamp", ""),
            "event": link.get("event", ""),
            "attack_stage": link.get("attack_stage", "Unknown"),
            "mitre_technique": link.get("mitre_technique", ""),
            "mitre_id": link.get("mitre_id", ""),
            "severity": link.get("severity", "medium"),
            "details": " | ".join(details_parts),
        })

    return timeline


def get_timeline_summary(timeline: List[Dict[str, Any]]) -> str:
    """Generate a textual summary of the attack timeline."""
    if not timeline:
        return "No timeline events."

    stages = []
    for event in timeline:
        stage = event.get("attack_stage", "Unknown")
        if stage not in stages:
            stages.append(stage)

    try:
        start = timeline[0]["timestamp"]
        end = timeline[-1]["timestamp"]
        t_start = datetime.fromisoformat(start)
        t_end = datetime.fromisoformat(end)
        duration = t_end - t_start
        duration_str = f"{int(duration.total_seconds() // 60)} minutes"
    except (ValueError, TypeError, IndexError):
        duration_str = "unknown duration"

    severity_counts = {}
    for event in timeline:
        sev = event.get("severity", "medium")
        severity_counts[sev] = severity_counts.get(sev, 0) + 1

    return (
        f"Attack timeline: {len(timeline)} events over {duration_str}. "
        f"Stages: {' → '.join(stages)}. "
        f"Severity breakdown: {', '.join(f'{k}: {v}' for k, v in severity_counts.items())}."
    )
