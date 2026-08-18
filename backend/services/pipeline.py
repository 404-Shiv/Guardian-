"""Pipeline Service — Orchestrates the full agent pipeline."""

import uuid
from datetime import datetime
from typing import Dict, Any, List

from backend.agents.threat_hunter import hunt_threats
from backend.agents.correlation import correlate_events, get_attack_summary
from backend.agents.mitre_mapper import map_threats_to_mitre, enrich_chain_with_mitre
from backend.agents.timeline import build_timeline, get_timeline_summary
from backend.agents.digital_twin import build_infrastructure, simulate_response, get_all_impact_simulations
from backend.agents.response import generate_response_plans
from backend.agents.adversarial import challenge_plans
from backend.agents.decision import select_best_plan
from backend.database import save_incident, save_alert


def run_pipeline(logs: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Run the full GUARDIAN analysis pipeline on a set of log entries.

    Pipeline:
    1. Threat Hunter → Detect threats
    2. Correlation → Build attack chains
    3. MITRE Mapper → Map to ATT&CK framework
    4. Timeline → Build chronological timeline
    5. Digital Twin → Simulate infrastructure
    6. Response → Generate response plans
    7. Adversarial → Challenge response plans
    8. Decision → Select best response

    Returns a complete incident record.
    """
    incident_id = f"INC-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    created_at = datetime.now().isoformat()

    # Step 1: Threat Hunter
    threats = hunt_threats(logs)

    # Step 2: Correlation
    chain = correlate_events(logs, threats)

    # Step 3: MITRE ATT&CK Mapping
    mitre_mappings = map_threats_to_mitre(threats)
    enriched_chain = enrich_chain_with_mitre(chain)

    # Step 4: Timeline
    timeline = build_timeline(enriched_chain)

    # Step 5: Digital Twin
    _, twin_nodes, twin_edges = build_infrastructure()
    impact_simulations = get_all_impact_simulations()

    # Step 6: Response Plans
    response_plans = generate_response_plans(threats, enriched_chain)

    # Step 7: Adversarial Challenges
    adversarial_challenges = challenge_plans(response_plans)

    # Step 8: Decision
    final_decision = select_best_plan(response_plans, adversarial_challenges)

    # Build summary
    attack_summary = get_attack_summary(enriched_chain)
    timeline_summary = get_timeline_summary(timeline)

    primary_type = "Unknown"
    max_confidence = 0
    max_severity = "low"
    severity_order = {"low": 0, "medium": 1, "high": 2, "critical": 3}

    for t in threats:
        if t.get("confidence", 0) > max_confidence:
            max_confidence = t["confidence"]
            primary_type = t["attack_type"]
        if severity_order.get(t.get("severity", "low"), 0) > severity_order.get(max_severity, 0):
            max_severity = t["severity"]

    summary = (
        f"ATTACK DETECTED — Type: {primary_type} | "
        f"Severity: {max_severity.upper()} | "
        f"Confidence: {max_confidence * 100:.0f}% | "
        f"Threats: {len(threats)} | "
        f"MITRE Techniques: {len(mitre_mappings)} | "
        f"{attack_summary}"
    )

    # Build incident record
    incident = {
        "id": incident_id,
        "created_at": created_at,
        "status": "analyzed",
        "threats": threats,
        "attack_chain": enriched_chain,
        "mitre_mappings": mitre_mappings,
        "timeline": timeline,
        "response_plans": response_plans,
        "adversarial_challenges": adversarial_challenges,
        "final_decision": final_decision,
        "impact_simulations": impact_simulations,
        "digital_twin_nodes": twin_nodes,
        "digital_twin_edges": twin_edges,
        "summary": summary,
    }

    # Persist
    save_incident(incident_id, incident)

    # Save individual alerts
    for threat in threats:
        save_alert({
            "incident_id": incident_id,
            "timestamp": created_at,
            "attack_type": threat["attack_type"],
            "severity": threat["severity"],
            "confidence": threat["confidence"],
            "source_ip": threat.get("source_ip"),
            "target_user": threat.get("target_user"),
            "target_host": threat.get("target_host"),
            "evidence": threat.get("evidence", []),
        })

    return incident
