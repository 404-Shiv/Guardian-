"""Threat Hunter Agent — Detects suspicious patterns in security logs."""

from typing import List, Dict, Any
from collections import defaultdict
from datetime import datetime, timedelta


def hunt_threats(logs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Analyze logs for suspicious patterns and return threat detections.
    Uses rule-based heuristics to identify common attack patterns.
    """
    threats = []

    # Index logs by various dimensions
    by_source_ip = defaultdict(list)
    by_user = defaultdict(list)
    by_host = defaultdict(list)

    for log in logs:
        by_source_ip[log.get("source_ip", "")].append(log)
        by_user[log.get("user", "")].append(log)
        by_host[log.get("host", "")].append(log)

    # --- Rule 1: Brute Force Detection ---
    for ip, ip_logs in by_source_ip.items():
        failed_logins = [l for l in ip_logs if "failed login" in l.get("event", "").lower()]
        if len(failed_logins) >= 5:
            # Check time window
            timestamps = sorted([l["timestamp"] for l in failed_logins])
            try:
                t_start = datetime.fromisoformat(timestamps[0])
                t_end = datetime.fromisoformat(timestamps[-1])
                window_minutes = (t_end - t_start).total_seconds() / 60
            except (ValueError, TypeError):
                window_minutes = 10

            if window_minutes <= 15:
                confidence = min(0.95, 0.70 + (len(failed_logins) - 5) * 0.05)
                # Check if followed by successful login
                success_after = [
                    l for l in ip_logs
                    if "successful login" in l.get("event", "").lower()
                    and l["timestamp"] > timestamps[-1]
                ]
                if success_after:
                    confidence = min(0.98, confidence + 0.10)

                target_users = list(set(l.get("user", "") for l in failed_logins if l.get("user")))
                threats.append({
                    "attack_type": "Brute Force",
                    "confidence": round(confidence, 2),
                    "severity": "high",
                    "evidence": [l.get("raw_log", "") for l in failed_logins[:5]] +
                                ([success_after[0].get("raw_log", "")] if success_after else []),
                    "source_ip": ip,
                    "target_user": target_users[0] if target_users else None,
                    "target_host": failed_logins[0].get("host"),
                })

    # --- Rule 2: Command Execution (PowerShell) ---
    for host, host_logs in by_host.items():
        ps_events = [l for l in host_logs if "powershell" in l.get("event", "").lower()]
        if ps_events:
            # Check for suspicious keywords in raw_log
            suspicious_keywords = [
                "encodedcommand", "invoke-", "downloadstring", "bypass",
                "mimikatz", "set-executionpolicy", "iex(", "hidden"
            ]
            suspicious = [
                l for l in ps_events
                if any(kw in l.get("raw_log", "").lower() for kw in suspicious_keywords)
            ]

            if suspicious:
                confidence = min(0.95, 0.75 + len(suspicious) * 0.05)
                severity = "critical" if any("mimikatz" in l.get("raw_log", "").lower() for l in suspicious) else "high"
            else:
                confidence = 0.65
                severity = "medium"
                suspicious = ps_events

            users = list(set(l.get("user", "") for l in suspicious if l.get("user")))
            threats.append({
                "attack_type": "Command Execution",
                "confidence": round(confidence, 2),
                "severity": severity,
                "evidence": [l.get("raw_log", "") for l in suspicious[:5]],
                "source_ip": suspicious[0].get("source_ip"),
                "target_user": users[0] if users else None,
                "target_host": host,
            })

    # --- Rule 3: Privilege Escalation ---
    for host, host_logs in by_host.items():
        priv_events = [l for l in host_logs if "privilege escalation" in l.get("event", "").lower()]
        if priv_events:
            confidence = min(0.95, 0.80 + len(priv_events) * 0.05)
            users = list(set(l.get("user", "") for l in priv_events if l.get("user")))
            threats.append({
                "attack_type": "Privilege Escalation",
                "confidence": round(confidence, 2),
                "severity": "critical",
                "evidence": [l.get("raw_log", "") for l in priv_events],
                "source_ip": priv_events[0].get("source_ip"),
                "target_user": users[0] if users else None,
                "target_host": host,
            })

    # --- Rule 4: Credential Access / Dumping ---
    all_cred_dumps = [l for l in logs if "credential dumping" in l.get("event", "").lower()]
    if all_cred_dumps:
        confidence = min(0.97, 0.85 + len(all_cred_dumps) * 0.04)
        users = list(set(l.get("user", "") for l in all_cred_dumps if l.get("user")))
        threats.append({
            "attack_type": "Credential Access",
            "confidence": round(confidence, 2),
            "severity": "critical",
            "evidence": [l.get("raw_log", "") for l in all_cred_dumps],
            "source_ip": all_cred_dumps[0].get("source_ip"),
            "target_user": users[0] if users else None,
            "target_host": all_cred_dumps[0].get("host"),
        })

    # --- Rule 5: Data Exfiltration ---
    exfil_events = [l for l in logs if "exfiltration" in l.get("event", "").lower()]
    if exfil_events:
        # Check for large transfers in raw_log
        total_mb = 0
        for e in exfil_events:
            raw = e.get("raw_log", "").lower()
            for token in raw.split():
                if "mb" in token:
                    try:
                        total_mb += float(token.replace("mb", "").replace(",", ""))
                    except ValueError:
                        pass
                elif "gb" in token:
                    try:
                        total_mb += float(token.replace("gb", "").replace(",", "")) * 1024
                    except ValueError:
                        pass

        confidence = 0.87 if total_mb > 100 else 0.75
        if total_mb > 500:
            confidence = 0.94

        users = list(set(l.get("user", "") for l in exfil_events if l.get("user")))
        threats.append({
            "attack_type": "Data Exfiltration",
            "confidence": round(confidence, 2),
            "severity": "critical",
            "evidence": [l.get("raw_log", "") for l in exfil_events],
            "source_ip": exfil_events[0].get("source_ip"),
            "target_user": users[0] if users else None,
            "target_host": exfil_events[0].get("host"),
        })

    # --- Rule 6: Port Scanning ---
    for ip, ip_logs in by_source_ip.items():
        scan_events = [l for l in ip_logs if "port scan" in l.get("event", "").lower()]
        if scan_events:
            confidence = min(0.90, 0.70 + len(scan_events) * 0.10)
            threats.append({
                "attack_type": "Reconnaissance",
                "confidence": round(confidence, 2),
                "severity": "medium",
                "evidence": [l.get("raw_log", "") for l in scan_events],
                "source_ip": ip,
                "target_user": None,
                "target_host": scan_events[0].get("host"),
            })

    # --- Rule 7: DoS / DDoS ---
    dos_events = [l for l in logs if "dos" in l.get("event", "").lower()]
    if dos_events:
        source_ips = list(set(l.get("source_ip", "") for l in dos_events))
        is_ddos = len(source_ips) > 1
        confidence = 0.85 if is_ddos else 0.80
        threats.append({
            "attack_type": "DDoS" if is_ddos else "DoS",
            "confidence": round(confidence, 2),
            "severity": "high",
            "evidence": [l.get("raw_log", "") for l in dos_events],
            "source_ip": ", ".join(source_ips[:5]),
            "target_user": None,
            "target_host": dos_events[0].get("host"),
        })

    return threats
