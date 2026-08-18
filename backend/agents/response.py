"""Response Agent — Generates and scores response plans."""

from typing import List, Dict, Any
from backend.agents.digital_twin import simulate_response


def generate_response_plans(threats: List[Dict[str, Any]], chain: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Generate 2-3 response plans based on detected threats and attack chain.
    Each plan is scored by Security (50%), Business Impact (20%), Downtime (20%), Cost (10%).
    """
    # Determine the severity and type of attack
    has_brute_force = any(t["attack_type"] in ("Brute Force",) for t in threats)
    has_privesc = any(t["attack_type"] in ("Privilege Escalation",) for t in threats)
    has_cred_access = any(t["attack_type"] in ("Credential Access",) for t in threats)
    has_exfil = any(t["attack_type"] in ("Data Exfiltration",) for t in threats)
    has_execution = any(t["attack_type"] in ("Command Execution",) for t in threats)

    max_severity = "low"
    severity_order = {"low": 0, "medium": 1, "high": 2, "critical": 3}
    for t in threats:
        if severity_order.get(t.get("severity", "low"), 0) > severity_order.get(max_severity, 0):
            max_severity = t["severity"]

    plans = []

    # --- Plan A: Minimal — Block IP ---
    plan_a_actions = [
        {
            "action": "Block IP",
            "description": "Block attacker source IP at perimeter firewall",
            "target": "Firewall",
        },
        {
            "action": "Enhanced Monitoring",
            "description": "Deploy enhanced monitoring on affected hosts",
            "target": "All affected hosts",
        },
    ]
    plan_a_impacts = [simulate_response("block_ip"), simulate_response("monitor_host")]
    plan_a_scores = _score_plan(plan_a_impacts, severity=max_severity, plan_strength="low")
    plans.append({
        "plan_id": "plan_a",
        "name": "Plan A: Block & Monitor",
        "actions": plan_a_actions,
        "scores": plan_a_scores,
        "total_score": plan_a_scores["total"],
        "security_impact": sum(i["security_score_delta"] for i in plan_a_impacts),
        "users_affected": sum(i["users_affected"] for i in plan_a_impacts),
        "estimated_downtime_minutes": max((i["downtime_minutes"] for i in plan_a_impacts), default=0),
        "risk_reduction": sum(i["risk_reduction_pct"] for i in plan_a_impacts) / len(plan_a_impacts),
    })

    # --- Plan B: Moderate — Disable Account + Reset Credentials ---
    plan_b_actions = [
        {
            "action": "Block IP",
            "description": "Block attacker source IP at perimeter firewall",
            "target": "Firewall",
        },
        {
            "action": "Disable Account",
            "description": "Disable compromised user account",
            "target": "Active Directory",
        },
        {
            "action": "Reset Credentials",
            "description": "Force password reset and revoke sessions",
            "target": "Active Directory",
        },
    ]
    plan_b_impacts = [simulate_response("block_ip"), simulate_response("disable_account"), simulate_response("reset_credentials")]
    plan_b_scores = _score_plan(plan_b_impacts, severity=max_severity, plan_strength="medium")
    plans.append({
        "plan_id": "plan_b",
        "name": "Plan B: Disable Account + Reset Credentials",
        "actions": plan_b_actions,
        "scores": plan_b_scores,
        "total_score": plan_b_scores["total"],
        "security_impact": sum(i["security_score_delta"] for i in plan_b_impacts),
        "users_affected": sum(i["users_affected"] for i in plan_b_impacts),
        "estimated_downtime_minutes": max((i["downtime_minutes"] for i in plan_b_impacts), default=0),
        "risk_reduction": sum(i["risk_reduction_pct"] for i in plan_b_impacts) / len(plan_b_impacts),
    })

    # --- Plan C: Aggressive — Full Quarantine ---
    plan_c_actions = [
        {
            "action": "Block IP",
            "description": "Block attacker source IP at perimeter firewall",
            "target": "Firewall",
        },
        {
            "action": "Disable Account",
            "description": "Disable compromised user account",
            "target": "Active Directory",
        },
        {
            "action": "Quarantine Host",
            "description": "Isolate compromised workstation from network",
            "target": "Workstation",
        },
        {
            "action": "Enable MFA",
            "description": "Force multi-factor authentication",
            "target": "Active Directory",
        },
    ]
    plan_c_impacts = [
        simulate_response("block_ip"),
        simulate_response("disable_account"),
        simulate_response("quarantine_host"),
        simulate_response("enable_mfa"),
    ]
    plan_c_scores = _score_plan(plan_c_impacts, severity=max_severity, plan_strength="high")
    plans.append({
        "plan_id": "plan_c",
        "name": "Plan C: Full Quarantine + MFA",
        "actions": plan_c_actions,
        "scores": plan_c_scores,
        "total_score": plan_c_scores["total"],
        "security_impact": sum(i["security_score_delta"] for i in plan_c_impacts),
        "users_affected": sum(i["users_affected"] for i in plan_c_impacts),
        "estimated_downtime_minutes": max((i["downtime_minutes"] for i in plan_c_impacts), default=0),
        "risk_reduction": sum(i["risk_reduction_pct"] for i in plan_c_impacts) / len(plan_c_impacts),
    })

    return plans


def _score_plan(impacts: List[Dict[str, Any]], severity: str = "high", plan_strength: str = "medium") -> Dict[str, float]:
    """
    Score a plan based on weighted criteria.
    Security: 50%, Business Impact: 20%, Downtime: 20%, Cost: 10%
    """
    # Security score — higher is better for stronger plans
    avg_risk_reduction = sum(i["risk_reduction_pct"] for i in impacts) / len(impacts)
    security = min(100, avg_risk_reduction * 1.5)

    # Severity bonus — stronger plans score higher against critical threats
    severity_multiplier = {"low": 0.6, "medium": 0.8, "high": 1.0, "critical": 1.1}
    strength_bonus = {"low": -10, "medium": 0, "high": 10}
    security = min(100, security * severity_multiplier.get(severity, 1.0) + strength_bonus.get(plan_strength, 0))

    # Business impact — lower users affected is better
    total_users = sum(i["users_affected"] for i in impacts)
    business_impact = max(0, 100 - total_users * 2)

    # Downtime — lower is better
    max_downtime = max((i["downtime_minutes"] for i in impacts), default=0)
    downtime = max(0, 100 - max_downtime * 1.5)

    # Cost — fewer actions is cheaper
    cost = max(0, 100 - len(impacts) * 15)

    # Weighted total
    total = (security * 0.50) + (business_impact * 0.20) + (downtime * 0.20) + (cost * 0.10)

    return {
        "security": round(security, 1),
        "business_impact": round(business_impact, 1),
        "downtime": round(downtime, 1),
        "cost": round(cost, 1),
        "total": round(total, 1),
    }
