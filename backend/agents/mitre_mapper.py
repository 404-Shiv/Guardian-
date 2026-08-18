"""MITRE ATT&CK Mapper — Maps detected behaviors to MITRE techniques."""

from typing import List, Dict, Any


# MITRE ATT&CK technique database
MITRE_DATABASE = {
    "T1110": {
        "id": "T1110",
        "name": "Brute Force",
        "tactic": "Credential Access",
        "description": "Adversaries may use brute force techniques to gain access to accounts.",
        "keywords": ["failed login", "brute force", "password spray", "credential stuffing"],
    },
    "T1059.001": {
        "id": "T1059.001",
        "name": "PowerShell",
        "tactic": "Execution",
        "description": "Adversaries may abuse PowerShell commands and scripts for execution.",
        "keywords": ["powershell", "invoke-", "iex", "encoded command", "downloadstring"],
    },
    "T1068": {
        "id": "T1068",
        "name": "Exploitation for Privilege Escalation",
        "tactic": "Privilege Escalation",
        "description": "Adversaries may exploit software vulnerabilities to escalate privileges.",
        "keywords": ["privilege escalation", "admin", "uac bypass", "domain admin", "elevated"],
    },
    "T1003": {
        "id": "T1003",
        "name": "OS Credential Dumping",
        "tactic": "Credential Access",
        "description": "Adversaries may attempt to dump credentials from the OS.",
        "keywords": ["credential dump", "lsass", "mimikatz", "sam database", "ntlm hash", "credential access"],
    },
    "T1041": {
        "id": "T1041",
        "name": "Exfiltration Over C2 Channel",
        "tactic": "Exfiltration",
        "description": "Adversaries may steal data by exfiltrating it over an existing C2 channel.",
        "keywords": ["exfiltration", "data transfer", "outbound", "c2 channel", "data theft"],
    },
    "T1046": {
        "id": "T1046",
        "name": "Network Service Discovery",
        "tactic": "Discovery",
        "description": "Adversaries may attempt to get a listing of services running on remote hosts.",
        "keywords": ["port scan", "nmap", "service discovery", "network scan", "enumeration"],
    },
    "T1053.005": {
        "id": "T1053.005",
        "name": "Scheduled Task",
        "tactic": "Persistence",
        "description": "Adversaries may abuse task scheduling to execute malicious code.",
        "keywords": ["scheduled task", "schtasks", "persistence", "at job"],
    },
    "T1070.001": {
        "id": "T1070.001",
        "name": "Clear Windows Event Logs",
        "tactic": "Defense Evasion",
        "description": "Adversaries may clear event logs to hide evidence of an intrusion.",
        "keywords": ["clear-eventlog", "wevtutil", "log clearing", "remove-item.*log"],
    },
    "T1498": {
        "id": "T1498",
        "name": "Network Denial of Service",
        "tactic": "Impact",
        "description": "Adversaries may perform DoS attacks to degrade or block availability.",
        "keywords": ["dos", "ddos", "syn flood", "denial of service", "amplification"],
    },
    "T1078": {
        "id": "T1078",
        "name": "Valid Accounts",
        "tactic": "Initial Access",
        "description": "Adversaries may obtain and abuse valid credentials for initial access.",
        "keywords": ["successful login", "valid credentials", "compromised account"],
    },
    "T1550": {
        "id": "T1550",
        "name": "Use Alternate Authentication Material",
        "tactic": "Lateral Movement",
        "description": "Adversaries may use alternate auth material like hashes for lateral movement.",
        "keywords": ["pass the hash", "ntlm", "lateral movement", "stolen hash"],
    },
}

# Map attack types to primary MITRE techniques
ATTACK_TYPE_TO_MITRE = {
    "brute force": ["T1110", "T1078"],
    "command execution": ["T1059.001"],
    "privilege escalation": ["T1068", "T1053.005"],
    "credential access": ["T1003"],
    "data exfiltration": ["T1041"],
    "reconnaissance": ["T1046"],
    "dos": ["T1498"],
    "ddos": ["T1498"],
}

# Map attack stages to MITRE techniques
STAGE_TO_MITRE = {
    "Reconnaissance": "T1046",
    "Initial Access": "T1078",
    "Execution": "T1059.001",
    "Persistence": "T1053.005",
    "Privilege Escalation": "T1068",
    "Defense Evasion": "T1070.001",
    "Credential Access": "T1003",
    "Lateral Movement": "T1550",
    "Exfiltration": "T1041",
    "Impact": "T1498",
}


def map_threats_to_mitre(threats: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Map threat detections to MITRE ATT&CK techniques."""
    mappings = []
    seen_techniques = set()

    for threat in threats:
        attack_type = threat.get("attack_type", "").lower()
        technique_ids = ATTACK_TYPE_TO_MITRE.get(attack_type, [])

        for tid in technique_ids:
            if tid in seen_techniques:
                continue
            seen_techniques.add(tid)

            tech = MITRE_DATABASE.get(tid)
            if tech:
                evidence_list = threat.get("evidence", [])
                evidence_str = evidence_list[0] if evidence_list else f"Detected {threat.get('attack_type', 'unknown')} activity"
                mappings.append({
                    "technique_id": tech["id"],
                    "technique_name": tech["name"],
                    "tactic": tech["tactic"],
                    "evidence": evidence_str,
                })

    return mappings


def enrich_chain_with_mitre(chain: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Add MITRE technique info to each link in the attack chain."""
    enriched = []
    for link in chain:
        stage = link.get("attack_stage", "")
        mitre_id = STAGE_TO_MITRE.get(stage, "")
        tech = MITRE_DATABASE.get(mitre_id, {})

        # Deeper matching by raw_log keywords
        raw = link.get("raw_log", "").lower()
        event = link.get("event", "").lower()
        combined = f"{raw} {event}"

        best_match_id = mitre_id
        best_match_score = 0

        for tid, tech_info in MITRE_DATABASE.items():
            score = sum(1 for kw in tech_info["keywords"] if kw in combined)
            if score > best_match_score:
                best_match_score = score
                best_match_id = tid

        if best_match_score > 0:
            tech = MITRE_DATABASE.get(best_match_id, {})
            mitre_id = best_match_id

        enriched_link = dict(link)
        enriched_link["mitre_id"] = mitre_id
        enriched_link["mitre_technique"] = tech.get("name", "Unknown")
        enriched.append(enriched_link)

    return enriched


def get_mitre_technique(technique_id: str) -> Dict[str, Any]:
    """Look up a MITRE technique by ID."""
    return MITRE_DATABASE.get(technique_id, {})
