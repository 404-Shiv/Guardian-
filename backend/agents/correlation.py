"""Correlation Agent — Connects related events into attack chains."""

from typing import List, Dict, Any
from collections import defaultdict
from datetime import datetime


# Attack stage ordering for classification
ATTACK_STAGE_ORDER = [
    "Reconnaissance",
    "Initial Access",
    "Execution",
    "Persistence",
    "Privilege Escalation",
    "Defense Evasion",
    "Credential Access",
    "Discovery",
    "Lateral Movement",
    "Collection",
    "Exfiltration",
    "Impact",
]

EVENT_TO_STAGE = {
    "port scan detected": "Reconnaissance",
    "failed login": "Initial Access",
    "successful login": "Initial Access",
    "powershell execution": "Execution",
    "privilege escalation": "Privilege Escalation",
    "credential dumping": "Credential Access",
    "data exfiltration": "Exfiltration",
    "dos attack": "Impact",
    "ddos attack": "Impact",
}


def correlate_events(logs: List[Dict[str, Any]], threats: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Correlate events by IP, user, host, and timestamp to build attack chains.
    Returns ordered attack chain links.
    """
    if not logs:
        return []

    # Identify malicious IPs and users from threat detections
    malicious_ips = set()
    malicious_users = set()
    for t in threats:
        if t.get("source_ip"):
            for ip in t["source_ip"].split(", "):
                malicious_ips.add(ip.strip())
        if t.get("target_user"):
            malicious_users.add(t["target_user"])

    # If no threats identified, can't correlate
    if not malicious_ips and not malicious_users:
        return []

    # Filter logs to only those related to malicious actors
    related_logs = []
    for log in logs:
        is_related = False
        src = log.get("source_ip", "")
        dst = log.get("destination_ip", "")
        user = log.get("user", "")

        if src in malicious_ips or dst in malicious_ips:
            is_related = True
        if user in malicious_users and user != "unknown":
            is_related = True

        if is_related:
            related_logs.append(log)

    # Sort by timestamp
    def parse_ts(log_entry):
        try:
            return datetime.fromisoformat(log_entry.get("timestamp", ""))
        except (ValueError, TypeError):
            return datetime.min

    related_logs.sort(key=parse_ts)

    # Build attack chain
    chain = []
    seen_events = set()

    for log in related_logs:
        event_key = f"{log['timestamp']}_{log['event']}_{log.get('source_ip', '')}"
        if event_key in seen_events:
            continue
        seen_events.add(event_key)

        event_lower = log.get("event", "").lower()
        attack_stage = EVENT_TO_STAGE.get(event_lower, "Unknown")

        # More specific stage classification
        if attack_stage == "Initial Access" and "successful" in event_lower:
            raw = log.get("raw_log", "").lower()
            if "lateral" in raw or "ntlm" in raw or "hash" in raw:
                attack_stage = "Lateral Movement"

        if attack_stage == "Execution":
            raw = log.get("raw_log", "").lower()
            if "clear-eventlog" in raw or "remove-item" in raw:
                attack_stage = "Defense Evasion"

        chain.append({
            "timestamp": log.get("timestamp", ""),
            "event": log.get("event", ""),
            "source_ip": log.get("source_ip", ""),
            "destination_ip": log.get("destination_ip", ""),
            "user": log.get("user", ""),
            "host": log.get("host", ""),
            "severity": log.get("severity", "medium"),
            "attack_stage": attack_stage,
            "mitre_technique": "",
            "mitre_id": "",
            "raw_log": log.get("raw_log", ""),
        })

    return chain


def get_attack_summary(chain: List[Dict[str, Any]]) -> str:
    """Generate a human-readable summary of the attack chain."""
    if not chain:
        return "No attack chain identified."

    stages = []
    for link in chain:
        stage = link.get("attack_stage", "Unknown")
        if stage not in stages:
            stages.append(stage)

    users = list(set(l.get("user", "") for l in chain if l.get("user") and l["user"] != "unknown"))
    ips = list(set(l.get("source_ip", "") for l in chain if l.get("source_ip")))

    summary_parts = [
        f"Attack chain with {len(chain)} events across {len(stages)} stages.",
        f"Stages: {' → '.join(stages)}.",
    ]
    if users:
        summary_parts.append(f"Targeted users: {', '.join(users)}.")
    if ips:
        summary_parts.append(f"Source IPs: {', '.join(ips[:5])}.")

    return " ".join(summary_parts)
